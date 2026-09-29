package com.code3d.config;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class EnvLoader {

    private static boolean loaded = false;

    public static synchronized void load() {
        if (loaded) return;

        File envFile = findEnvFile();
        if (envFile != null && envFile.exists()) {
            try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    line = line.trim();
                    if (line.isEmpty() || line.startsWith("#")) continue;

                    int eqIdx = line.indexOf('=');
                    if (eqIdx > 0) {
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();

                        // Strip optional surrounding quotes
                        if ((val.startsWith("\"") && val.endsWith("\"")) ||
                            (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }

                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                    }
                }
            } catch (IOException e) {
                System.err.println("Notice: Could not read .env file: " + e.getMessage());
            }
        }

        normalizeDatabaseProperties();
        loaded = true;
    }

    private static File findEnvFile() {
        File[] candidates = new File[] {
                new File(".env"),
                new File("backend/.env"),
                new File("../backend/.env"),
                new File(System.getProperty("user.dir"), ".env"),
                new File(System.getProperty("user.dir"), "backend/.env")
        };

        for (File f : candidates) {
            if (f.exists() && f.isFile()) {
                return f;
            }
        }
        return null;
    }

    private static void normalizeDatabaseProperties() {
        String dbUrl = getPropertyOrEnv("SPRING_DATASOURCE_URL");
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = getPropertyOrEnv("DB_URL");
        }
        if (dbUrl == null || dbUrl.isBlank()) {
            dbUrl = getPropertyOrEnv("DATABASE_URL");
        }
        String dbUser = getPropertyOrEnv("SPRING_DATASOURCE_USERNAME");
        if (dbUser == null || dbUser.isBlank()) {
            dbUser = getPropertyOrEnv("DB_USERNAME");
        }
        if (dbUser == null || dbUser.isBlank()) {
            dbUser = getPropertyOrEnv("DATABASE_USERNAME");
        }
        String dbPass = getPropertyOrEnv("SPRING_DATASOURCE_PASSWORD");
        if (dbPass == null || dbPass.isBlank()) {
            dbPass = getPropertyOrEnv("DB_PASSWORD");
        }
        if (dbPass == null || dbPass.isBlank()) {
            dbPass = getPropertyOrEnv("DATABASE_PASSWORD");
        }

        if (dbUrl != null && !dbUrl.isBlank()) {
            // Convert standard postgresql:// to jdbc:postgresql://
            if (!dbUrl.startsWith("jdbc:")) {
                if (dbUrl.startsWith("postgres://")) {
                    dbUrl = "jdbc:postgresql://" + dbUrl.substring("postgres://".length());
                } else if (dbUrl.startsWith("postgresql://")) {
                    dbUrl = "jdbc:postgresql://" + dbUrl.substring("postgresql://".length());
                }
            }

            // Extract credentials from URL if present (e.g. jdbc:postgresql://user:pass@host/db)
            Pattern pattern = Pattern.compile("jdbc:postgresql://([^:]+):([^@]+)@(.+)");
            Matcher matcher = pattern.matcher(dbUrl);
            if (matcher.find()) {
                if (dbUser == null || dbUser.isBlank()) {
                    dbUser = matcher.group(1);
                    System.setProperty("DATABASE_USERNAME", dbUser);
                    System.setProperty("DB_USERNAME", dbUser);
                }
                if (dbPass == null || dbPass.isBlank()) {
                    dbPass = matcher.group(2);
                    System.setProperty("DATABASE_PASSWORD", dbPass);
                    System.setProperty("DB_PASSWORD", dbPass);
                }
                dbUrl = "jdbc:postgresql://" + matcher.group(3);
            }

            if (dbUrl.contains("postgresql") && !dbUrl.contains("connectTimeout")) {
                dbUrl += (dbUrl.contains("?") ? "&" : "?") + "connectTimeout=30&socketTimeout=30";
            }

            System.setProperty("DATABASE_URL", dbUrl);
            System.setProperty("DB_URL", dbUrl);
            System.setProperty("spring.datasource.url", dbUrl);
        }

        if (dbUser != null && !dbUser.isBlank()) {
            System.setProperty("DATABASE_USERNAME", dbUser);
            System.setProperty("DB_USERNAME", dbUser);
            System.setProperty("spring.datasource.username", dbUser);
        }

        if (dbPass != null && !dbPass.isBlank()) {
            System.setProperty("DATABASE_PASSWORD", dbPass);
            System.setProperty("DB_PASSWORD", dbPass);
            System.setProperty("spring.datasource.password", dbPass);
        }

        if (dbUrl != null && dbUrl.contains("postgresql")) {
            System.setProperty("spring.datasource.driver-class-name", "org.postgresql.Driver");
            System.setProperty("spring.jpa.database-platform", "org.hibernate.dialect.PostgreSQLDialect");
        }
    }

    private static String getPropertyOrEnv(String key) {
        String val = System.getProperty(key);
        if (val != null && !val.isBlank()) return val;
        val = System.getenv(key);
        if (val != null && !val.isBlank()) return val;
        return null;
    }
}
