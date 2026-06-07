package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/upload")
public class UploadController {

    // 假设你的项目根目录下有个 upload 文件夹
    private final String UPLOAD_DIR = System.getProperty("user.dir") + "/upload/";

    @PostMapping("/file")
    public Result<Map<String, String>> upload(MultipartFile file) throws IOException {
        if (file.isEmpty()) return Result.error("文件为空");

        // 1. 确保上传目录存在
        File dir = new File(UPLOAD_DIR);
        if (!dir.exists()) {
            boolean created = dir.mkdirs();
            if (!created) return Result.error("无法创建上传目录");
        }

        // 2. 生成新文件名，防止覆盖
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null) originalFilename = "unknown.mp3";
        String suffix = originalFilename.contains(".") ? originalFilename.substring(originalFilename.lastIndexOf(".")) : "";
        String newFileName = UUID.randomUUID().toString() + suffix;

        // 3. 保存文件
        File dest = new File(UPLOAD_DIR + newFileName);
        file.transferTo(dest);

        // 4. 返回前端可访问的路径
        Map<String, String> map = new HashMap<>();
        map.put("url", "/upload/" + newFileName);

        return Result.success(map);
    }
}