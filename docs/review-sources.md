# 每日温习 内容与规则

## 内容

- 机器人学74张概念卡：根据本站已有课程复习讲义独立整理，覆盖基础概念、旋转、齐次变换、改进D-H、正逆运动学、雅可比、静力学、动力学与轨迹规划。统一使用右手系、列向量和课程改进D-H约定，附讲解链接。
- 考研词汇4801条：从skywind3000/ECDICT的`ky`标签提取，保留词义、音标、英文定义、词形变化和语料词频字段。不是某一年度官方考试大纲的完整校订本。
- 名言30则：原句取自古典作品和公版英文作品，逐条标明作者、作品及可核对链接。中文解释与外文意译为本站整理，保留必要语境与异文提示。

词典许可全文：`public/review/ECDICT-LICENSE.txt`。固定上游提交与源CSV SHA-256：`public/review/vocabulary-provenance.json`。可用`python scripts/build_vocabulary.py <ecdict.csv> <revision.txt>`重新生成。

主要原文来源：

- [ECDICT](https://github.com/skywind3000/ECDICT)
- [论语](https://ctext.org/analects/zh)
- [道德经](https://ctext.org/dao-de-jing/zh)
- [荀子·劝学](https://ctext.org/xunzi/quan-xue/zh)
- [庄子·养生主](https://ctext.org/zhuangzi/nourishing-the-lord-of-life/zh)
- [Walden, Project Gutenberg #205](https://www.gutenberg.org/files/205/205-h/205-h.htm)
- [Emerson, Essays: First Series, Project Gutenberg #2944](https://www.gutenberg.org/files/2944/2944-h/2944-h.htm)

## 复习与打卡

每天按Asia/Shanghai计算日期。默认目标是评估10张不同卡片，达到后自动记作打卡；浏览、翻面、重复评估同一卡片不会增加当日不同卡片数。连续天数允许今天尚未完成时延续到昨天。

优先推荐到期卡片，再补充每日新卡额度，初始为机器人学5张、英语10张、名言2张，可在计划中调整。忘记后10分钟重现；其余等级以天为单位延长间隔，上限365天。

记录保存在localStorage的`xuyi-daily-review-v1`中。导入备份严格校验版本、日期、数值范围和自建卡片结构，合并已有记录；同卡采用较新的复习状态，同日合并卡片编号。无账号、无云同步，不向评论系统或第三方发送学习记录。

验证命令：`node scripts/check_review.mjs`。
