package com.test.backend.service;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class ServiceSupport {

	private ServiceSupport() {
	}

	public static boolean activeOrDefault(Boolean active) {
		return active == null || active;
	}

	public static ResponseStatusException notFound(String message) {
		return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
	}
}
