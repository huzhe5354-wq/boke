package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Music;
import com.huzhe.portfolio.service.MusicService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/music")
@CrossOrigin
public class MusicController {

    private final MusicService musicService;

    public MusicController(MusicService musicService) {
        this.musicService = musicService;
    }

    @GetMapping("/list")
    public Result<List<Music>> list() {
        List<Music> list = musicService.lambdaQuery()
                .orderByAsc(Music::getSort)
                .list();
        return Result.success(list);
    }

    @GetMapping("/{id}")
    public Result<Music> getById(@PathVariable Long id) {
        Music music = musicService.getById(id);
        if (music == null) {
            return Result.error("音乐不存在");
        }
        return Result.success(music);
    }

    @PostMapping("/add")
    public Result<String> add(@RequestBody Music music) {
        boolean saved = musicService.save(music);
        return saved ? Result.success("新增成功") : Result.error("新增失败");
    }

    @PutMapping("/update")
    public Result<String> update(@RequestBody Music music) {
        if (music.getId() == null) {
            return Result.error("音乐 ID 不能为空");
        }
        boolean updated = musicService.updateById(music);
        return updated ? Result.success("修改成功") : Result.error("修改失败");
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean removed = musicService.removeById(id);
        return removed ? Result.success("删除成功") : Result.error("删除失败");
    }
}