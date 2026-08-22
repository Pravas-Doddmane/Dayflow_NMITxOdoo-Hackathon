package com.techtitans.dayflow;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class DayFlowApplication {

	public static void main(String[] args) {
		SpringApplication.run(DayFlowApplication.class, args);
	}

}
