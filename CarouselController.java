package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Carousel;
import com.huzhe.portfolio.service.CarouselService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/carousel")
@CrossOrigin
public class CarouselController {

    private final CarouselService carouselService;

    public CarouselController(CarouselService carouselService) {
        this.carouselService = carouselService;
    }

    @GetMapping("/list")
    public Result<List<Carousel>> list() {
        List<Carousel> list = carouselService.lambdaQuery()
                .orderByAsc(Carousel::getSort)
                .list();
        return Result.success(list);
    }

    @PostMapping("/add")
    public Result<String> add(@RequestBody Carousel carousel) {
        carouselService.save(carousel);
        return Result.success("新增成功");
    }

    @PutMapping("/update")
    public Result<String> update(@RequestBody Carousel carousel) {
        carouselService.updateById(carousel);
        return Result.success("更新成功");
    }

    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        carouselService.removeById(id);
        return Result.success("删除成功");
    }
}