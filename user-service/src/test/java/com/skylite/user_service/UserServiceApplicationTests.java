package com.skylite.user_service;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import com.skylite.user_service.entity.Admin;
import com.skylite.user_service.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;

@SpringBootTest
class UserServiceApplicationTests {

	@Autowired
	private AdminRepository adminRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Test
	void contextLoads() {
	}

	@Test
	void seedAdmin() {
		adminRepository.findByEmail("admin@skylite.com").ifPresent(adminRepository::delete);
		
		Admin admin = new Admin();
		admin.setName("System Admin");
		admin.setEmail("admin@skylite.com");
		admin.setPassword(passwordEncoder.encode("Admin123!"));
		adminRepository.save(admin);
		System.out.println("Admin seeded successfully.");
	}

}
