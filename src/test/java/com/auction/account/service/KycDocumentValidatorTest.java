package com.auction.account.service;

import com.auction.common.service.ImageForensicsService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class KycDocumentValidatorTest {

    private final KycDocumentValidator validator =
            new KycDocumentValidator(8L * 1024 * 1024, 24_000_000, new ImageForensicsService());

    @Test
    void acceptsAValidPngBasedOnContentNotFileName() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "frontImage", "fake-extension.exe", "application/octet-stream", png(800, 500));
        KycDocumentValidator.ValidatedImage result = validator.validate(file, "front ID");
        assertEquals(".png", result.extension());
    }

    @Test
    void rejectsContentThatIsNotAnImage() {
        MockMultipartFile file = new MockMultipartFile(
                "frontImage", "id.jpg", "image/jpeg", "not-an-image".getBytes());
        assertThrows(IllegalArgumentException.class, () -> validator.validate(file, "front ID"));
    }

    @Test
    void rejectsImagesWithUnsafeDimensions() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "frontImage", "id.png", "image/png", png(200, 100));
        assertThrows(IllegalArgumentException.class, () -> validator.validate(file, "front ID"));
    }

    private byte[] png(int width, int height) throws Exception {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        ByteArrayOutputStream output = new ByteArrayOutputStream();
        ImageIO.write(image, "png", output);
        return output.toByteArray();
    }
}
