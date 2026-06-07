package com.huzhe.portfolio.controller;

import com.huzhe.portfolio.common.Result;
import com.huzhe.portfolio.entity.Project;
import com.huzhe.portfolio.service.ProjectService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/project")
@CrossOrigin // 允许跨域
public class ProjectController {

    private final ProjectService projectService;

    // 使用构造器注入，比 @Autowired 更推荐
    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    /**
     * R - 获取所有项目（按创建时间降序排序）
     */
    @GetMapping("/list")
    public Result<List<Project>> list() {
        // 利用 MyBatis-Plus lambda 链式调用
        List<Project> list = projectService.lambdaQuery()
                .orderByDesc(Project::getCreateTime)
                .list();
        return Result.success(list);
    }

    /**
     * R - 根据 ID 查询单条项目（用于前端回显编辑数据，修复原本前端加载失败的Bug）
     */
    @GetMapping("/{id}")
    public Result<Project> getById(@PathVariable Long id) {
        Project project = projectService.getById(id);
        if (project == null) {
            return Result.error("项目不存在");
        }
        return Result.success(project);
    }

    /**
     * C - 新增项目
     */
    @PostMapping("/add")
    public Result<String> add(@RequestBody Project project) {
        boolean saved = projectService.save(project);
        return saved ? Result.success("新增成功") : Result.error("新增失败");
    }

    /**
     * U - 更新项目（修复原本前端 saveProject 无法执行 PUT 请求的 Bug）
     */
    @PutMapping("/update")
    public Result<String> update(@RequestBody Project project) {
        if (project.getId() == null) {
            return Result.error("项目 ID 不能为空");
        }
        boolean updated = projectService.updateById(project);
        return updated ? Result.success("更新成功") : Result.error("更新失败");
    }

    /**
     * D - 删除项目
     */
    @DeleteMapping("/delete/{id}")
    public Result<String> delete(@PathVariable Long id) {
        boolean removed = projectService.removeById(id);
        return removed ? Result.success("删除成功") : Result.error("删除失败");
    }
}