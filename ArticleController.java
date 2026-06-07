package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Article;
import com.huzhe.portfolio.service.ArticleService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/article")
@CrossOrigin
public class ArticleController {

    private final ArticleService articleService;

    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    /**
     * R - 获取文章列表
     */
    @GetMapping("/list")
    public Result<List<Article>> list() {
        List<Article> list = articleService.lambdaQuery()
                .orderByDesc(Article::getCreateTime)
                .list();
        return Result.success(list);
    }

    /**
     * R - 获取单条文章详情
     */
    @GetMapping("/{id}")
    public Result<Article> getById(@PathVariable Long id) {
        Article article = articleService.getById(id);
        if (article == null) {
            return Result.error("文章不存在");
        }
        // 每阅读一次，阅读量自增 1 (简单演练更新)
        if (article.getViews() == null) {
            article.setViews(1);
        } else {
            article.setViews(article.getViews() + 1);
        }
        articleService.updateById(article);
        return Result.success(article);
    }

    /**
     * C - 新增文章
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Article article) {
        boolean saved = articleService.save(article);
        return saved ? Result.success("新增成功") : Result.error("新增失败");
    }

    /**
     * U - 修改文章
     */
    @PutMapping("/update")
    public Result<String> update(@RequestBody Article article) {
        if (article.getId() == null) {
            return Result.error("文章 ID 不能为空");
        }
        boolean updated = articleService.updateById(article);
        return updated ? Result.success("修改成功") : Result.error("修改失败");
    }

    /**
     * D - 删除文章
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean removed = articleService.removeById(id);
        return removed ? Result.success("删除成功") : Result.error("删除失败");
    }
}
