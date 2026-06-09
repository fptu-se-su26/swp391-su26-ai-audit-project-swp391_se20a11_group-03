package com.swp391.util;

import com.lowagie.text.DocumentException;
import com.lowagie.text.pdf.BaseFont;
import org.springframework.stereotype.Component;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.xhtmlrenderer.pdf.ITextRenderer;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.util.Map;

/**
 * @author Pham Manh Thang
 */
@Component
public class ThymeleafPDFUtil {

    private static final String[] VIETNAMESE_FONT_PATHS = {
            "C:\\Windows\\Fonts\\arial.ttf",
            "C:\\Windows\\Fonts\\times.ttf"
    };

    private final TemplateEngine templateEngine;

    public ThymeleafPDFUtil(TemplateEngine templateEngine) {
        this.templateEngine = templateEngine;
    }

    public byte[] generatePdf(String templateName, Map<String, Object> data) throws DocumentException {
        Context context = new Context();
        context.setVariables(data);
        String html = templateEngine.process(templateName, context);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ITextRenderer renderer = new ITextRenderer();
        registerVietnameseFonts(renderer);
        renderer.setDocumentFromString(html);
        renderer.layout();
        renderer.createPDF(outputStream);
        return outputStream.toByteArray();
    }

    private void registerVietnameseFonts(ITextRenderer renderer) throws DocumentException {
        for (String fontPath : VIETNAMESE_FONT_PATHS) {
            if (new File(fontPath).exists()) {
                try {
                    renderer.getFontResolver().addFont(fontPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                } catch (IOException e) {
                    throw new DocumentException(e);
                }
            }
        }
    }
}
