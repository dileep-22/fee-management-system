package com.feemanagement.service;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.exception.BusinessException;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * Handles all real Razorpay interactions:
 *  - Creating orders via the Razorpay Orders API
 *  - Verifying payment signatures using HMAC-SHA256
 *
 * Razorpay amounts are in the smallest currency unit (paise for INR).
 * ₹100.00  →  10000 paise
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RazorpayService {

    private final RazorpayClient razorpayClient;

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    /**
     * Creates a real Razorpay order.
     * Returns the order details the frontend needs to open the checkout popup.
     */
    public FeeDTO.GatewayOrderResponse createOrder(Long feeRecordId, BigDecimal amountInRupees,
                                                    String currency, String description) {
        try {
            // Convert rupees → paise (integer, no decimals)
            long amountInPaise = amountInRupees
                    .multiply(BigDecimal.valueOf(100))
                    .setScale(0, RoundingMode.HALF_UP)
                    .longValue();

            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount",          amountInPaise);
            orderRequest.put("currency",        currency != null ? currency : "INR");
            orderRequest.put("receipt",         "FEE-" + feeRecordId + "-" + System.currentTimeMillis());
            orderRequest.put("payment_capture", true);

            JSONObject notes = new JSONObject();
            notes.put("feeRecordId", feeRecordId);
            notes.put("description", description != null ? description : "Fee payment");
            orderRequest.put("notes", notes);

            Order order = razorpayClient.orders.create(orderRequest);
            String razorpayOrderId = order.get("id");

            log.info("Razorpay order created: {} for feeRecord={} amount={}",
                    razorpayOrderId, feeRecordId, amountInRupees);

            return FeeDTO.GatewayOrderResponse.builder()
                    .orderId(razorpayOrderId)
                    .keyId(keyId)
                    .amount(amountInRupees)
                    .currency(order.get("currency"))
                    .status(order.get("status"))
                    .gatewayName("RAZORPAY")
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed for feeRecord={}: {}", feeRecordId, e.getMessage());
            throw new BusinessException("Payment gateway error: " + e.getMessage());
        }
    }

    /**
     * Verifies the Razorpay payment signature using HMAC-SHA256.
     *
     * Razorpay signs: orderId + "|" + paymentId  with the key secret.
     * We recompute and compare — if they match, the payment is genuine.
     */
    public void verifySignature(String razorpayOrderId, String razorpayPaymentId,
                                String razorpaySignature) {
        try {
            String payload = razorpayOrderId + "|" + razorpayPaymentId;
            String expected = hmacSha256(payload, keySecret);

            if (!expected.equalsIgnoreCase(razorpaySignature)) {
                log.warn("Signature mismatch for order={} payment={}", razorpayOrderId, razorpayPaymentId);
                throw new BusinessException("Payment signature verification failed — possible tampering detected.");
            }
            log.info("Payment signature verified ✓ order={} payment={}", razorpayOrderId, razorpayPaymentId);

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            log.error("Signature verification error: {}", e.getMessage());
            throw new BusinessException("Could not verify payment: " + e.getMessage());
        }
    }

    private String hmacSha256(String data, String secret)
            throws NoSuchAlgorithmException, InvalidKeyException {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder sb = new StringBuilder(hash.length * 2);
        for (byte b : hash) sb.append(String.format("%02x", b));
        return sb.toString();
    }
}
