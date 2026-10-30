package com.code3d.repository;

import com.code3d.entity.UserRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserRecord, Long> {

    @Query("SELECT u FROM UserRecord u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:identifier)) OR LOWER(TRIM(u.email)) = LOWER(TRIM(:identifier)) ORDER BY u.id ASC")
    List<UserRecord> findByIdentifierIgnoreCase(@Param("identifier") String identifier);

    @Query("SELECT u FROM UserRecord u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:username)) ORDER BY u.id ASC")
    List<UserRecord> findAllByUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT u FROM UserRecord u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email)) ORDER BY u.id ASC")
    List<UserRecord> findAllByEmailIgnoreCase(@Param("email") String email);

    Optional<UserRecord> findFirstByUsernameIgnoreCaseOrderByIdAsc(String username);

    Optional<UserRecord> findFirstByEmailIgnoreCaseOrderByIdAsc(String email);

    @Query("SELECT COUNT(u) > 0 FROM UserRecord u WHERE LOWER(TRIM(u.username)) = LOWER(TRIM(:username))")
    boolean existsByTrimmedUsernameIgnoreCase(@Param("username") String username);

    @Query("SELECT COUNT(u) > 0 FROM UserRecord u WHERE LOWER(TRIM(u.email)) = LOWER(TRIM(:email))")
    boolean existsByTrimmedEmailIgnoreCase(@Param("email") String email);

    default Optional<UserRecord> findByUsername(String username) {
        return findFirstByUsernameIgnoreCaseOrderByIdAsc(username);
    }

    default Optional<UserRecord> findByEmail(String email) {
        return findFirstByEmailIgnoreCaseOrderByIdAsc(email);
    }

    default boolean existsByUsername(String username) {
        return existsByTrimmedUsernameIgnoreCase(username);
    }

    default boolean existsByEmail(String email) {
        return existsByTrimmedEmailIgnoreCase(email);
    }
}
