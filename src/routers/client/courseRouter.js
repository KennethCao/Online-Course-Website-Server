const express = require("express");

let router = express.Router();

// 1. 课程分类
router.get("/category", (req, resp)=>{
    resp.tool.execSQLAutoResponse(`
        SELECT
            id,
            title 
        FROM
            t_course_category 
        WHERE
            parent_id = 0;
    `, "获取课程分类成功！")
})

// 2. 获取课程列表(根据分类ID进行获取)
router.get("/list", (req, resp)=>{
    const {page_num=1, page_size=10, category_id="-1"} = req.query;
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            category_id,
            title,
            fm_url,
            is_hot,
            count(t_comments.id) as comment_total_count,
            avg( IFNULL(t_comments.score,0) ) as comment_avg_score
        FROM
            t_course
            LEFT JOIN t_comments ON t_course.id=t_comments.course_id
        GROUP BY
            t_course.id
            ${"" + category_id === "-1" ? "" : "HAVING category_id=" + category_id}
        LIMIT ${(page_num - 1) * page_size}, ${page_size};
    `, "获取课程列表成功！")
})

// 3. 课程基本信息
router.get("/basic_info/:id", (req, resp) => {
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_course.id,
            title,
            fm_url,
            is_hot,
            t_course.intro,
            teacher_id,
            name,
            header,
            position,
            count( t_comments.id ) AS comment_count,
            IFNULL( avg( t_comments.score ), 0 ) AS comment_avg_score 
        FROM
            t_course
            LEFT JOIN t_comments ON t_comments.course_id = t_course.id
            LEFT JOIN t_teacher ON t_course.teacher_id = t_teacher.id 
        GROUP BY
            t_course.id
            HAVING id=${id};
    `, "获取课程基本信息成功!")
})

// 4. 课程大纲
router.get("/outline/:id", (req, resp) => {
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
    SELECT
        id,
        num,
        title,
        video_url 
    FROM
        t_course_outline 
    WHERE
        course_id = ${id}
    ORDER BY
        num;
    `, "获取课程大纲成功！")
})

// 5. 评论
router.get("/comment/:id", (req, resp) => {
    const {id} = req.params;
    resp.tool.execSQLAutoResponse(`
    SELECT
        tc.id,
        score,
        content,
        create_time,
        nick_name,
        header 
    FROM
        t_comments AS tc
        INNER JOIN t_user AS tu ON tc.user_id = tu.id 
    WHERE
        course_id = ${id}
    ORDER BY
        create_time DESC;
    `, "获取课程评论列表成功!")
})

module.exports = router;