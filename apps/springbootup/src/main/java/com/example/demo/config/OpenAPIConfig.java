package com.example.demo.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenAPIConfig {
  @Bean
  public OpenAPI defineOpenApi() {
    Server server = new Server();
    server.setUrl("http://localhost:8080");
    server.setDescription("Development");

    Contact contact = new Contact();
    contact.setName("Your Name");
    contact.setEmail("your.email@example.com");

    Info information = new Info()
        .title("Your API Title")
        .version("1.0")
        .description("Your API Description")
        .contact(contact);

    return new OpenAPI().info(information).servers(List.of(server));
  }
}
