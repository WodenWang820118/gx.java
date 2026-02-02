package com.gx.aggregator.config;

import java.util.logging.Logger;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.grpc.client.GrpcChannelBuilderCustomizer;
import org.springframework.grpc.client.GrpcChannelFactory;

import io.grpc.ClientInterceptor;
import io.grpc.ManagedChannelBuilder;
import io.grpc.Metadata;
import io.grpc.stub.MetadataUtils;
import org.springframework.http.converter.protobuf.ProtobufJsonFormatHttpMessageConverter;

import com.google.protobuf.util.JsonFormat;
import com.gx.stock.StockServiceGrpc;
import com.gx.user.UserServiceGrpc;

/**
 * Advanced gRPC channel configuration for Spring Boot 4.
 * 
 * NOTE: Most basic settings (keep-alive, timeouts, message sizes) should be
 * configured via application.properties using spring.grpc.client.* properties.
 * 
 * Use GrpcChannelBuilderCustomizer ONLY for:
 * - Custom interceptors
 * - Dynamic/conditional configuration
 * - Settings not available via properties
 */
@Configuration
public class GrpcConfig {
    private static final Logger logger = Logger.getLogger(GrpcConfig.class.getName());

    /**
     * Global customizer applied to ALL gRPC clients.
     * Use for cross-cutting concerns like logging, metrics, or auth.
     */
    @Bean
    public <T extends ManagedChannelBuilder<T>> GrpcChannelBuilderCustomizer<T> globalChannelCustomizer() {
        return (authority, builder) -> {
            logger.info("Configuring global gRPC channel for: " + authority);

            // Example: Add custom interceptor for all clients
            builder.intercept(loggingInterceptor());

            // Example: Add metadata headers (e.g., for authentication)
            Metadata metadata = new Metadata();
            metadata.put(Metadata.Key.of("client-id", Metadata.ASCII_STRING_MARSHALLER), "aggregator-service");
            builder.intercept(MetadataUtils.newAttachHeadersInterceptor(metadata));
        };
    }

    /**
     * Client-specific customizer for user-service.
     * Use for configuration unique to a specific service.
     */
    @Bean
    public <T extends ManagedChannelBuilder<T>> GrpcChannelBuilderCustomizer<T> userServiceChannelCustomizer() {
        return (authority, builder) -> {
            // Only apply to user-service
            if ("user-service".equals(authority)) {
                logger.info("Applying user-service specific configuration");

                // Example: Service-specific interceptor
                builder.intercept(userServiceInterceptor());

                // Example: Advanced settings not available in properties
                builder.enableRetry()
                        .maxRetryAttempts(5)
                        .perRpcBufferLimit(1024 * 1024); // 1MB per RPC buffer
            }
        };
    }

    /**
     * Example custom interceptor for logging requests/responses.
     * In production, consider using observability frameworks.
     */
    private ClientInterceptor loggingInterceptor() {
        return new ClientInterceptor() {
            @Override
            public <ReqT, RespT> io.grpc.ClientCall<ReqT, RespT> interceptCall(
                    io.grpc.MethodDescriptor<ReqT, RespT> method,
                    io.grpc.CallOptions callOptions,
                    io.grpc.Channel next) {

                logger.fine(() -> "Calling method: " + method.getFullMethodName());
                return next.newCall(method, callOptions);
            }
        };
    }

    /**
     * Example service-specific interceptor.
     */
    private ClientInterceptor userServiceInterceptor() {
        return new ClientInterceptor() {
            @Override
            public <ReqT, RespT> io.grpc.ClientCall<ReqT, RespT> interceptCall(
                    io.grpc.MethodDescriptor<ReqT, RespT> method,
                    io.grpc.CallOptions callOptions,
                    io.grpc.Channel next) {

                logger.fine(() -> "User service call: " + method.getFullMethodName());
                return next.newCall(method, callOptions);
            }
        };
    }

    @Bean
    public ProtobufJsonFormatHttpMessageConverter protobufJsonFormatHttpMessageConverter() {
        return new ProtobufJsonFormatHttpMessageConverter(
                JsonFormat.parser().ignoringUnknownFields(),
                JsonFormat.printer()
                        .omittingInsignificantWhitespace());
    }

    /**
     * Create UserService gRPC stub bean.
     * The authority "user-service" must match the property prefix in
     * application.properties
     */
    @Bean
    public UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub(GrpcChannelFactory channelFactory) {
        return UserServiceGrpc.newBlockingStub(channelFactory.createChannel("user-service"));
    }

    /**
     * Create StockService async stub bean.
     * The authority "stock-service" must match the property prefix in
     * application.properties
     */
    @Bean
    public StockServiceGrpc.StockServiceStub stockServiceStub(GrpcChannelFactory channelFactory) {
        return StockServiceGrpc.newStub(channelFactory.createChannel("stock-service"));
    }
}
