const express = require("express");

let router = express.Router();

// 1. 讲师列表: 支持分页 + 明星讲师筛选
router.get("/list", (req, resp) => {
    // is_star === -1 全部讲师  1 明星 0 不是明星
    const {page_num = 1, page_size = 6, is_star = "-1"} = req.query;
    resp.tool.execSQLAutoResponse(`
        SELECT
            t_teacher.id,
            header,
            position,
            name,
            is_star,
            count( t_course.id ) AS course_count,
            t_teacher.intro 
        FROM
            t_teacher
            LEFT JOIN t_course ON t_teacher.id = t_course.teacher_id 
        GROUP BY
            t_teacher.id
        HAVING
            is_star in (${"" + is_star === "-1" ? "0, 1" : is_star}) 
        LIMIT ${(page_num - 1) * page_size}, ${page_size};
    `, "获取讲师列表成功！")
})

// 2. 讲师详情
// 方法一：不适用于数据量庞大的情况。若数据量很庞大，建议分成两个接口
// router.get("/detail/:id", (req, resp)=>{
//     const {id} = req.params;
//     if (!id) {
//         resp.send(resp.tool.ResponseTemp(-2, "必须填写参数id"))
//         return;
//     }
//     resp.tool.execSQL(`
//         SELECT
//             id,
//             NAME,
//             header,
//             position,
//             intro,
//             is_star
//         FROM
//             t_teacher
//         WHERE
//             id = ${id};
//     `).then(result=>{
//         // console.log(result)
//         if (result.length >= 1) {
//             let teacher = result[0];
//             // 执行一个sql, 获取, 讲师对应的课程信息
//             resp.tool.execSQL(`
//             SELECT
//                 t_course.id,
//                 teacher_id,
//                 title,
//                 fm_url,
//                 is_hot,
//                 count( t_comments.id ) AS comment_total_count,
//                 avg( IFNULL( t_comments.score, 0 ) ) AS comment_avg_score
//             FROM
//                 t_course
//                 LEFT JOIN t_comments ON t_course.id = t_comments.course_id
//             GROUP BY
//                 t_course.id
//             HAVING
//                 teacher_id = ${id};
//             `).then(courseResult=>{
//                 teacher.courses = courseResult;
//                 console.log(teacher)
//             })
//         }
//     })
// })
// 方法二：
router.get("/detail/:id", (req, resp) => {
    const {id} = req.params;
    if (!id) {
        resp.send(resp.tool.ResponseTemp(-2, "必须填写参数id"))
        return;
    }
    // 第一部分的结果是一个Promise对象，第二部分的结果也是一个Promise对象
    // 对代码进行改写: 使用Promis.all()并行两个任务
    Promise.all([resp.tool.execSQL(`
        SELECT
            id,
            name,
            header,
            position,
            intro,
            is_star
        FROM
            t_teacher
        WHERE
            id = ${id};
    `), resp.tool.execSQL(`
            SELECT
                t_course.id,
                teacher_id,
                title,
                fm_url,
                is_hot,
                count( t_comments.id ) AS comment_total_count,
                avg( IFNULL( t_comments.score, 0 ) ) AS comment_avg_score
            FROM
                t_course
                LEFT JOIN t_comments ON t_course.id = t_comments.course_id
            GROUP BY
                t_course.id
            HAVING
                teacher_id = ${id};
            `)]).then(([teacherResult, courseResult]) => {
        if (teacherResult.length >= 1) {
            let teacher = teacherResult[0];
            teacher.courses = courseResult;
            resp.send(resp.tool.ResponseTemp(0, "讲师详情请求成功！", teacher));
        } else {
            resp.send(resp.tool.ResponseTemp(0, "讲师详情请求成功！", {}));
        }

    })
})

module.exports = router;