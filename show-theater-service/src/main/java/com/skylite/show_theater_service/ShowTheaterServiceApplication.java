package com.skylite.show_theater_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ShowTheaterServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ShowTheaterServiceApplication.class, args);
	}

}
