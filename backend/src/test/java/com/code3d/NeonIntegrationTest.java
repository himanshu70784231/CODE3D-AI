package com.code3d;

import com.code3d.config.EnvLoader;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

public class NeonIntegrationTest {

    @BeforeAll
    public static void setUp() {
        EnvLoader.load();
    }

    @Test
    public void testDirectNeonPostgreSqlConnection() throws Exception {
        String url = System.getProperty("DATABASE_URL");
        String user = System.getProperty("DATABASE_USERNAME");
        String pass = System.getProperty("DATABASE_PASSWORD");

        assertNotNull(url, "DATABASE_URL must be configured");
        assertTrue(url.contains("postgresql"), "DATABASE_URL must be PostgreSQL");

        Class.forName("org.postgresql.Driver");
        DriverManager.setLoginTimeout(30);

        try (Connection conn = DriverManager.getConnection(url, user, pass);
             Statement stmt = conn.createStatement()) {

            assertNotNull(conn);
            assertFalse(conn.isClosed());

            // 1. Real PostgreSQL SELECT query
            try (ResultSet rs = stmt.executeQuery("SELECT version(), current_database(), current_user")) {
                assertTrue(rs.next());
                String version = rs.getString(1);
                String database = rs.getString(2);
                String currentUser = rs.getString(3);

                System.out.println("=================================================");
                System.out.println("REAL NEON POSTGRESQL CONNECTED SUCCESSFULLY!");
                System.out.println("Version:  " + version);
                System.out.println("Database: " + database);
                System.out.println("User:     " + currentUser);
                System.out.println("=================================================");

                assertTrue(version.toLowerCase().contains("postgresql"));
            }

            // 2. Inspect existing tables in public schema
            try (ResultSet rs = stmt.executeQuery(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")) {
                Set<String> tables = new HashSet<>();
                while (rs.next()) {
                    tables.add(rs.getString("table_name"));
                }
                System.out.println("Public tables found in Neon: " + tables);
            }

            // 3. Inspect columns of users, execution_history, programs, quiz_records
            String[] targetTables = {"users", "execution_history", "programs", "quiz_records"};
            for (String table : targetTables) {
                System.out.println("=== Table: " + table + " ===");
                try (ResultSet rs = stmt.executeQuery(
                        "SELECT column_name, data_type, udt_name, is_nullable, column_default " +
                        "FROM information_schema.columns WHERE table_name = '" + table + "' ORDER BY ordinal_position")) {
                    while (rs.next()) {
                        System.out.println("  " + rs.getString("column_name") + " : " +
                                rs.getString("data_type") + " (" + rs.getString("udt_name") + ") " +
                                "nullable=" + rs.getString("is_nullable") + " default=" + rs.getString("column_default"));
                    }
                }
            }

            // 4. Enums
            System.out.println("=== Postgres Enums ===");
            try (ResultSet rs = stmt.executeQuery(
                    "SELECT t.typname, e.enumlabel FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid ORDER BY t.typname, e.enumsortorder")) {
                while (rs.next()) {
                    System.out.println("  " + rs.getString(1) + " -> " + rs.getString(2));
                }
            }

            // 5. Existing rows in users and foreign keys referencing users
            System.out.println("=== Existing Users ===");
            try (ResultSet rs = stmt.executeQuery("SELECT id, username, email, role FROM users LIMIT 10")) {
                while (rs.next()) {
                    System.out.println("  User: id=" + rs.getObject(1) + ", username=" + rs.getString(2) + ", email=" + rs.getString(3) + ", role=" + rs.getString(4));
                }
            }

            // Check row counts of other tables
            String[] checkTables = {"sessions", "user_settings", "executions", "history", "algorithm_executions"};
            for (String t : checkTables) {
                try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM " + t)) {
                    if (rs.next()) {
                        System.out.println("Table " + t + " count: " + rs.getLong(1));
                    }
                } catch (Exception e) {
                    System.out.println("Table " + t + " error: " + e.getMessage());
                }
            }

            // Verify users table exists and is accessible
            try (ResultSet rs = stmt.executeQuery("SELECT count(*) FROM users")) {
                if (rs.next()) {
                    System.out.println("Verified users table accessible. Count: " + rs.getLong(1));
                }
            } catch (Exception e) {
                System.out.println("users table notice: " + e.getMessage());
            }
        }
    }
}
