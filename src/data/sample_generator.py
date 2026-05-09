"""生成开发测试用样本数据：200名学生 + 基础数据 + 借阅记录 + 选课成绩"""
import random
import csv
from datetime import date, timedelta
from pathlib import Path

MAJORS = ["计算机科学与技术", "软件工程", "电子信息工程", "自动化", "通信工程",
          "数学与应用数学", "信息与计算科学", "数据科学与大数据", "人工智能", "网络工程"]
GRADES = ["2022级", "2023级", "2024级", "2025级"]
BOOKS = [
    # (book_id, title, clc, author, publisher, year, summary)
    ("B001", "Python编程：从入门到实践", "TP311.56", "Eric Matthes", "人民邮电出版社", 2020, "Python入门经典教程，涵盖基础语法、项目实践"),
    ("B002", "算法导论", "TP301.6", "Thomas Cormen", "机械工业出版社", 2013, "计算机算法领域的经典教材，全面介绍算法设计与分析"),
    ("B003", "机器学习", "TP181", "周志华", "清华大学出版社", 2016, "机器学习领域入门教材，涵盖十大经典算法"),
    ("B004", "深度学习", "TP181", "Ian Goodfellow", "人民邮电出版社", 2017, "深度学习领域奠基之作，系统介绍神经网络"),
    ("B005", "数据挖掘：概念与技术", "TP274", "Jiawei Han", "机械工业出版社", 2012, "数据挖掘经典教材，涵盖分类/聚类/关联规则"),
    ("B006", "计算机网络：自顶向下方法", "TN915", "James Kurose", "机械工业出版社", 2017, "计算机网络经典教材"),
    ("B007", "计算机组成原理", "TP303", "David Patterson", "机械工业出版社", 2016, "计算机体系结构经典教材"),
    ("B008", "编译原理", "TP314", "Alfred Aho", "机械工业出版社", 2009, "编译器设计经典教材"),
    ("B009", "数据库系统概念", "TP311.13", "Abraham Silberschatz", "机械工业出版社", 2019, "数据库系统入门经典"),
    ("B010", "线性代数", "O151.2", "Gilbert Strang", "人民邮电出版社", 2018, "线性代数教材，适合工科学生"),
    ("B011", "统计学", "C8", "David Freedman", "机械工业出版社", 2016, "统计学入门教材"),
    ("B012", "离散数学及其应用", "O158", "Kenneth Rosen", "机械工业出版社", 2018, "离散数学经典教材"),
    ("B013", "信号与系统", "TN911.6", "Alan Oppenheim", "电子工业出版社", 2018, "信号处理经典教材"),
    ("B014", "操作系统概念", "TP316", "Abraham Silberschatz", "机械工业出版社", 2020, "操作系统经典教材"),
    ("B015", "计算机图形学", "TP391.41", "Peter Shirley", "清华大学出版社", 2018, "计算机图形学入门教材"),
    ("B016", "自然语言处理", "TP391", "Dan Jurafsky", "机械工业出版社", 2019, "NLP经典教材"),
    ("B017", "人工智能：一种现代方法", "TP18", "Stuart Russell", "清华大学出版社", 2020, "AI经典教材"),
    ("B018", "数学之美", "O1-49", "吴军", "人民邮电出版社", 2014, "科普读物，介绍数学在信息领域的应用"),
    ("B019", "C++ Primer", "TP312C", "Stanley Lippman", "电子工业出版社", 2013, "C++编程经典教材"),
    ("B020", "计算机体系结构：量化研究方法", "TP303", "John Hennessy", "机械工业出版社", 2019, "体系结构进阶教材"),
]
COURSES = [
    ("C001", "数据结构与算法", "必修", "计算机科学与技术学院"),
    ("C002", "操作系统", "必修", "计算机科学与技术学院"),
    ("C003", "数据库原理", "必修", "计算机科学与技术学院"),
    ("C004", "计算机网络", "必修", "计算机科学与技术学院"),
    ("C005", "软件工程导论", "选修", "计算机科学与技术学院"),
    ("C006", "机器学习导论", "选修", "计算机科学与技术学院"),
    ("C007", "深度学习实践", "选修", "计算机科学与技术学院"),
    ("C008", "数据挖掘", "选修", "计算机科学与技术学院"),
    ("C009", "自然语言处理", "选修", "计算机科学与技术学院"),
    ("C010", "大数据技术", "选修", "计算机科学与技术学院"),
    ("C011", "高等数学A", "必修", "数学与统计学院"),
    ("C012", "线性代数", "必修", "数学与统计学院"),
    ("C013", "概率论与数理统计", "必修", "数学与统计学院"),
    ("C014", "信号与系统", "必修", "电子信息工程学院"),
    ("C015", "数字电路", "必修", "电子信息工程学院"),
]


def generate_students(n: int = 200) -> list[dict]:
    """生成学生基本信息"""
    students = []
    for i in range(1, n + 1):
        students.append({
            "student_id": f"S{2022000 + i:04d}",
            "name": f"学生{i}",
            "grade": random.choice(GRADES),
            "major": random.choice(MAJORS),
            "gender": random.choice(["男", "女"]),
        })
    return students


def generate_borrow_records(students: list[dict], n_records: int = 2000) -> list[dict]:
    """生成借阅记录"""
    records = []
    base_date = date(2025, 9, 1)
    # 为每个学生预先分配兴趣偏好的书籍子集（模拟真实兴趣集中）
    student_prefs = {}
    for student in students:
        # 每个学生偏向借阅2-4本书（模拟真实兴趣集中）
        student_prefs[student["student_id"]] = random.sample(BOOKS, random.randint(2, 4))

    for _ in range(n_records):
        student = random.choice(students)
        # 80%概率从学生偏好书籍中选择，20%随机
        pref_books = student_prefs[student["student_id"]]
        book = random.choice(pref_books) if random.random() < 0.8 else random.choice(BOOKS)
        borrow_date = base_date + timedelta(days=random.randint(0, 180))
        return_date = borrow_date + timedelta(days=random.randint(1, 60))
        records.append({
            "student_id": student["student_id"],
            "book_id": book[0],
            "book_title": book[1],
            "clc_number": book[2],
            "author": book[3],
            "publisher": book[4],
            "borrow_date": borrow_date.isoformat(),
            "return_date": return_date.isoformat(),
            "renew_count": random.choices([0, 1, 2], weights=[0.7, 0.2, 0.1])[0],
        })
    return records


def generate_course_records(students: list[dict]) -> list[dict]:
    """为每个学生生成选课成绩"""
    records = []
    for student in students:
        n_courses = random.randint(4, 12)
        for course in random.sample(COURSES, n_courses):
            records.append({
                "student_id": student["student_id"],
                "course_id": course[0],
                "course_name": course[1],
                "course_type": course[2],
                "college": course[3],
                "score": round(random.uniform(60, 98), 1),
                "semester": "2025-2026-1",
            })
    return records


def save_csv(data: list[dict], filepath: str, columns: list[str]):
    """将数据写入CSV文件"""
    Path(filepath).parent.mkdir(parents=True, exist_ok=True)
    with open(filepath, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=columns)
        writer.writeheader()
        writer.writerows(data)


if __name__ == "__main__":
    data_dir = Path("data/processed")
    data_dir.mkdir(parents=True, exist_ok=True)

    students = generate_students(200)
    save_csv(students, str(data_dir / "students.csv"), ["student_id", "name", "grade", "major", "gender"])
    print(f"生成{len(students)}名学生")

    borrows = generate_borrow_records(students, 2000)
    cols = ["student_id", "book_id", "book_title", "clc_number", "author", "publisher", "borrow_date", "return_date", "renew_count"]
    save_csv(borrows, str(data_dir / "borrow_records.csv"), cols)
    print(f"生成{len(borrows)}条借阅记录")

    courses = generate_course_records(students)
    cols2 = ["student_id", "course_id", "course_name", "course_type", "college", "score", "semester"]
    save_csv(courses, str(data_dir / "course_records.csv"), cols2)
    print(f"生成{len(courses)}条选课记录")

    # 生成馆藏书目数据
    book_cols = ["book_id", "title", "clc_number", "author", "publisher", "publish_year", "summary", "total_copies", "available_copies"]
    book_data = []
    for b in BOOKS:
        total = random.randint(2, 10)
        available = random.randint(0, total)
        book_data.append({
            "book_id": b[0],
            "title": b[1],
            "clc_number": b[2],
            "author": b[3],
            "publisher": b[4],
            "publish_year": b[5],
            "summary": b[6],
            "total_copies": total,
            "available_copies": available,
        })
    save_csv(book_data, str(data_dir / "books_meta.csv"), book_cols)
    print(f"生成{len(book_data)}条书目数据")
