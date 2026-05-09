"""In-memory data store with realistic data generation for mock services."""

import random
import datetime
from typing import Optional

random.seed(42)

# ---------------------------------------------------------------------------
# Module-level containers (populated by init_data)
# ---------------------------------------------------------------------------
students = []
books = []
borrow_records = []
courses = []
course_records = []

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
COLLEGES = [
    ("信息与计算机学院", ["计算机科学与技术", "软件工程", "网络空间安全"]),
    ("电子与通信学院", ["电子信息工程", "通信工程"]),
    ("数学与统计学院", ["数学与应用数学", "统计学"]),
    ("人文与社会科学学院", ["哲学", "汉语言文学"]),
    ("经济与管理学院", ["经济学", "金融学", "信息管理与信息系统"]),
    ("外国语学院", ["英语", "日语"]),
    ("教育科学学院", ["教育学"]),
    ("物理与天文学院", ["物理学"]),
]

GRADE_LEVELS = [2022, 2023, 2024, 2025]

# ---------------------------------------------------------------------------
# 50 realistic books
# ---------------------------------------------------------------------------
BOOK_DATA = [
    ("TP311.1", "Python编程：从入门到实践（第3版）", "Eric Matthes",
     "本书是一本针对所有层次Python读者而作的Python入门书。全书分两部分：基础知识和项目实践。基础知识部分介绍了列表、字典、if语句、类、文件与异常等核心概念；项目实践部分则通过三个实战项目——外星人入侵游戏、数据可视化、Web应用程序——帮助读者将所学知识应用到实际开发中。"),
    ("TP312PY", "流畅的Python（第2版）", "Luciano Ramalho",
     "本书深入探讨了Python语言的高级特性，包括数据模型、序列、字典、函数对象、面向对象惯用法、控制流程、元编程等。作者通过大量代码示例，帮助读者掌握Pythonic的编程方式，写出更高效、更可读的代码。"),
    ("TP312PY", "利用Python进行数据分析（第3版）", "Wes McKinney",
     "本书由pandas库的作者亲笔撰写，全面介绍了使用Python进行数据清洗、处理、分析和可视化的方法。涵盖NumPy、pandas、matplotlib等核心库的用法，以及时间序列、数据聚合与分组运算等高级主题。"),
    ("TP18", "深度学习入门：基于Python的理论与实现", "斋藤康毅",
     "本书从零开始讲解深度学习的基础理论，不依赖任何高级框架，用Python一步一步实现神经网络。内容涵盖感知机、反向传播、卷积神经网络、循环神经网络等核心概念，帮助读者真正理解深度学习的底层原理。"),
    ("TP18", "深度学习（原书第2版）", "Ian Goodfellow",
     "深度学习领域的奠基性著作，由三位顶级专家撰写。系统介绍了深度学习的数学基础、神经网络架构、训练技巧、以及自然语言处理、计算机视觉等前沿应用领域的最新进展。"),
    ("TP311.12", "算法导论（原书第4版）", "Thomas H. Cormen",
     "计算机科学领域最经典的算法教科书。全面覆盖排序、图算法、动态规划、贪心算法、NP完全性等核心主题。第4版新增了线性规划、机器学习算法等现代内容，并更新了大量习题与实例。"),
    ("TP311.13", "数据挖掘：概念与技术（原书第4版）", "Jiawei Han",
     "数据挖掘领域的权威教材，系统介绍了数据预处理、频繁模式挖掘、分类、聚类、异常检测等核心方法。包含大量实际案例，涵盖Web挖掘、社交网络分析、图挖掘等前沿方向。"),
    ("TP311.13", "统计学习方法（第2版）", "李航",
     "全面系统地介绍了统计学习的主要方法，包括感知机、k近邻法、朴素贝叶斯法、决策树、支持向量机、提升方法、EM算法、隐马尔可夫模型、条件随机场等。每章配有丰富的例题和习题。"),
    ("TP303", "计算机组成与设计：硬件/软件接口（原书第5版）", "David A. Patterson",
     "计算机组成领域的经典教材，以RISC-V指令集为主线，深入讲解计算机的硬件组成和软硬件接口。涵盖指令系统、处理器设计、存储层次、并行处理等关键主题。"),
    ("TP314", "编译原理（第2版）", "Alfred V. Aho",
     "编译领域的经典龙书，全面介绍了编译器设计的各个阶段：词法分析、语法分析、语义分析、中间代码生成、代码优化和目标代码生成。理论与实践并重，是计算机科学教育的必修教材。"),
    ("TP301.6", "计算机程序设计艺术（卷1：基本算法）", "Donald E. Knuth",
     "计算机科学界的传世经典，由图灵奖得主高德纳倾注毕生心血写成。卷1系统介绍了基本算法概念、信息结构、以及数学预备知识，以严谨的数学分析著称，是算法研究者的必读之作。"),
    ("O158", "离散数学及其应用（原书第8版）", "Kenneth H. Rosen",
     "离散数学领域的经典教材，全面覆盖逻辑与证明、集合论、计数、图论、树、布尔代数等核心内容。书中包含大量来自计算机科学领域的应用实例，帮助读者理解离散数学的实用价值。"),
    ("O151.2", "线性代数及其应用（原书第5版）", "David C. Lay",
     "线性代数的经典教材，从线性方程组、矩阵运算出发，逐步深入到向量空间、特征值、正交性和对称矩阵。强调线性代数在工程和科学计算中的实际应用，配有丰富的计算实例。"),
    ("O21", "概率论与数理统计（第4版）", "盛骤",
     "国内最经典的概率论与数理统计教材之一。内容涵盖随机事件与概率、随机变量及其分布、数字特征、大数定律与中心极限定理、参数估计、假设检验、回归分析等。"),
    ("TP316", "操作系统概念（原书第10版）", "Abraham Silberschatz",
     "操作系统领域的权威教材，系统介绍进程管理、内存管理、存储管理、I/O系统、文件系统等核心概念。第10版新增了虚拟化、云计算等现代内容，并更新了Linux和Windows的最新特性。"),
    ("TP316.2", "现代操作系统（原书第5版）", "Andrew S. Tanenbaum",
     "以清晰的层次结构讲解操作系统的核心原理，包括进程与线程、内存管理、文件系统、I/O、死锁等内容。书中穿插了大量真实操作系统的案例分析，帮助读者将理论知识与实际系统联系起来。"),
    ("TP393.08", "计算机网络：自顶向下方法（原书第8版）", "James F. Kurose",
     "以自顶向下的独特视角讲解计算机网络的原理和协议。从应用层开始，逐层深入到传输层、网络层、链路层，最后介绍网络安全。每章都配有Wireshark实验，帮助读者直观理解网络协议的工作方式。"),
    ("TN915.04", "TCP/IP详解 卷1：协议（原书第2版）", "Kevin Fall",
     "TCP/IP协议族的权威指南，详细解释了TCP、IP、UDP、ICMP、ARP等核心协议的规范与实现。第2版新增了IPv6、多播、SCTP等现代协议的内容，是网络工程师的必备参考书。"),
    ("TP312C", "C++ Primer Plus（第6版）", "Stephen Prata",
     "C++编程的经典入门教材，从基本语法开始，逐步深入到类、继承、多态、模板、异常处理等高级特性。内容全面、示例丰富，适合初学者和有一定经验的程序员系统学习C++。"),
    ("TP312JA", "Java核心技术·卷1：基础知识（原书第12版）", "Cay S. Horstmann",
     "Java开发者的权威指南，全面覆盖Java SE的最新特性。内容包括Java编程基础、面向对象编程、接口与内部类、异常处理、泛型、集合、并发编程等核心主题。"),
    ("TP312JA", "深入理解Java虚拟机（第3版）", "周志明",
     "从Java虚拟机角度深入剖析Java技术的工作原理。内容涵盖内存区域、垃圾回收、类文件结构、类加载机制、字节码执行引擎、性能调优等核心主题。"),
    ("TP311.52", "设计模式：可复用面向对象软件的基础", "Erich Gamma",
     "GoF四人组的经典著作，系统总结了面向对象设计的23种设计模式，分为创建型、结构型和行为型三大类。每种模式都配有结构图、实现示例和应用场景分析。"),
    ("TP311.52", "重构：改善既有代码的设计（第2版）", "Martin Fowler",
     "软件重构领域的权威指南。详细介绍了重构的原则、方法和代码坏味识别技巧。第2版新增了基于JavaScript的示例，涵盖120多种重构手法，帮助开发者持续改进代码质量。"),
    ("TP311.52", "代码整洁之道", "Robert C. Martin",
     "Bob大叔的经典著作，从命名、函数、注释、格式、错误处理等多个维度阐述了编写整洁代码的原则和最佳实践。书中还包含大量的代码重构案例，帮助读者培养代码整洁的意识。"),
    ("TP311.52", "领域驱动设计：软件核心复杂性应对之道", "Eric Evans",
     "领域驱动设计（DDD）的开山之作。提出了通用语言、限界上下文、实体、值对象、聚合、领域事件等核心概念，为复杂软件系统的建模和设计提供了系统性的方法论。"),
    ("TP311.52", "微服务架构设计模式", "Chris Richardson",
     "系统介绍了微服务架构的设计模式和最佳实践。涵盖服务拆分、通信、数据管理、部署、测试、安全等关键主题。每种模式都配有详细的实现指南和实际案例。"),
    ("TP393.09", "大型网站技术架构：核心原理与案例分析", "李智慧",
     "深入剖析大型网站的技术架构设计，涵盖高性能架构、高可用架构、可伸缩架构、安全性设计等核心主题。通过真实案例帮助读者理解大规模分布式系统的设计理念和实践经验。"),
    ("TP18", "机器学习（西瓜书）", "周志华",
     "国内最经典的机器学习教材。系统介绍了机器学习的基本概念和主流方法，包括决策树、神经网络、支持向量机、贝叶斯分类、集成学习、聚类、降维等。语言流畅、数学推导严谨。"),
    ("TP18", "统计自然语言处理基础", "Christopher D. Manning",
     "自然语言处理领域的权威教材，全面介绍NLP的统计方法和机器学习技术。涵盖词法分析、句法分析、语义分析、语篇分析、机器翻译等多个方向。"),
    ("TP18", "强化学习（原书第2版）", "Richard S. Sutton",
     "强化学习领域的经典教材，由该领域的开创者撰写。系统介绍了马尔可夫决策过程、动态规划、蒙特卡洛方法、时序差分学习、策略梯度等核心算法。"),
    ("O13", "高等数学（第七版）上册", "同济大学数学系",
     "国内高校使用最广泛的高等数学教材。上册涵盖函数与极限、导数与微分、不定积分、定积分及其应用、微分方程等内容。"),
    ("O13", "高等数学（第七版）下册", "同济大学数学系",
     "高等数学下册涵盖空间解析几何、多元函数微分学、重积分、曲线积分与曲面积分、无穷级数等内容。与上册构成完整的高等数学知识体系。"),
    ("O141.4", "数学建模（原书第5版）", "Frank R. Giordano",
     "系统介绍数学建模的基本方法，涵盖比例建模、参数估计、最优化建模、概率建模、微分方程建模等。通过大量跨学科的实际案例，培养读者将现实问题转化为数学模型的能力。"),
    ("B0-0", "哲学通论（修订版）", "孙正聿",
     "以哲学的基本问题为主线，系统阐述了哲学的思维方式、哲学的基本问题、哲学的历史发展等内容。深入浅出地引导读者进入哲学思考的殿堂。"),
    ("B804", "批判性思维：思维、写作、沟通、应变能力（原书第7版）", "Richard Paul",
     "系统介绍了批判性思维的核心概念和方法，包括思维要素、思维标准、逻辑谬误识别、论证分析等。帮助读者在信息时代培养独立思考的能力。"),
    ("I106", "文学理论（新修订版）", "勒内·韦勒克",
     "西方文学理论领域的经典著作，系统论述了文学的本质、功能、文学作品的构成、文学的类型、文学评价等基本问题。是文学研究的必读参考书。"),
    ("I210.97", "中国现代文学三十年（修订本）", "钱理群",
     "系统梳理了中国现代文学三十年（1917-1949）的发展历程，对鲁迅、茅盾、巴金、老舍等重要作家及其作品进行了深入的分析和评价。"),
    ("I561.074", "小说面面观", "E.M.福斯特",
     "英国著名小说家福斯特的文学批评经典，提出了圆形人物与扁平人物、情节与故事等影响深远的文学概念。以生动优美的文笔解析了小说的七个基本面向。"),
    ("F0", "经济学原理：微观经济学分册（原书第8版）", "N. Gregory Mankiw",
     "全球最受欢迎的经济学入门教材。以清晰简洁的语言介绍了供给与需求、消费者行为、生产者行为、市场结构等微观经济学核心概念。"),
    ("F0", "经济学原理：宏观经济学分册（原书第8版）", "N. Gregory Mankiw",
     "宏观经济学入门经典，系统介绍了GDP、通货膨胀、失业、货币与财政政策、经济增长、国际贸易等核心宏观经济学主题。"),
    ("F830", "金融学原理（第5版）", "彭兴韵",
     "系统介绍了货币与信用、利率、金融市场、金融机构、中央银行、货币政策等金融学核心内容。理论与实践相结合，反映了中国金融改革的最新进展。"),
    ("F272.7", "大数据时代：生活、工作与思维的大变革", "Viktor Mayer-Schönberger",
     "前瞻性地分析了大数据时代带来的思维变革、商业变革和管理变革。通过丰富的案例展示了大数据如何重塑我们的生活、工作和思维方式。"),
    ("H314", "英语语法新思维（套装）", "张满胜",
     "以全新的视角系统讲解英语语法，从词法到句法，从简单句到复合句，层层递进。帮助学习者建立完整的英语语法体系，真正做到学以致用。"),
    ("H315", "中式英语之鉴", "Joan Pinkham",
     "系统分析了中国英语学习者常犯的中式英语错误。通过大量真实案例对比，帮助读者理解地道的英语表达方式，提高英语写作水平。"),
    ("H36", "综合日语（修订版）第一册", "彭广陆",
     "国内高校广泛使用的日语专业教材。从假名、发音开始，逐步深入到基础语法和日常会话。内容编排科学，配有丰富的练习和听力材料。"),
    ("G40-01", "教育学原理（第2版）", "王道俊",
     "系统论述了教育的基本概念、教育与人和社会的发展关系、教育目的、教育制度、课程、教学、德育等教育学核心问题。是师范专业的基础必修教材。"),
    ("G649.2", "高等教育学（修订版）", "潘懋元",
     "中国高等教育学科的奠基之作。系统论述了高等教育的本质、功能、结构、管理体制、教学理论、科学研究等核心问题。"),
    ("O4", "物理学（原书第10版）上卷", "David Halliday",
     "全球最经典的大学物理教材之一。上册涵盖力学、振动与波、热力学等内容。以清晰的讲解和丰富的例题著称，是理工科学生物理课程的标准参考书。"),
    ("O4", "物理学（原书第10版）下卷", "David Halliday",
     "物理学下册涵盖电磁学、光学、相对论、量子物理等内容。延续上册的风格，以严密的逻辑和生动的实例讲解物理学的核心概念和规律。"),
    ("TN710", "电子电路基础（第3版）", "童诗白",
     "国内电子技术领域的经典教材，系统介绍了半导体器件、基本放大电路、集成运算放大器、反馈放大电路、信号处理与产生电路、直流稳压电源等内容。"),
]

# ---------------------------------------------------------------------------
# 30 courses
# ---------------------------------------------------------------------------
COURSE_DATA = [
    ("C001", "高等数学A（上）", 6, "必修", "数学与统计学院"),
    ("C002", "高等数学A（下）", 6, "必修", "数学与统计学院"),
    ("C003", "线性代数", 3, "必修", "数学与统计学院"),
    ("C004", "概率论与数理统计", 3, "必修", "数学与统计学院"),
    ("C005", "离散数学", 3, "必修", "信息与计算机学院"),
    ("C006", "程序设计基础（Python）", 3, "必修", "信息与计算机学院"),
    ("C007", "数据结构与算法", 4, "必修", "信息与计算机学院"),
    ("C008", "计算机网络", 3, "必修", "信息与计算机学院"),
    ("C009", "操作系统原理", 3, "必修", "信息与计算机学院"),
    ("C010", "数据库系统原理", 3, "必修", "信息与计算机学院"),
    ("C011", "计算机组成原理", 4, "必修", "信息与计算机学院"),
    ("C012", "软件工程导论", 2, "必修", "信息与计算机学院"),
    ("C013", "人工智能导论", 2, "必修", "信息与计算机学院"),
    ("C014", "大学英语（一）", 4, "必修", "外国语学院"),
    ("C015", "大学英语（二）", 4, "必修", "外国语学院"),
    ("C016", "思想道德与法治", 2, "必修", "人文与社会科学学院"),
    ("C017", "马克思主义基本原理", 2, "必修", "人文与社会科学学院"),
    ("C018", "大学物理A（上）", 4, "必修", "物理与天文学院"),
    ("C019", "大学物理A（下）", 4, "必修", "物理与天文学院"),
    ("C020", "体育（一）", 1, "必修", "教育科学学院"),
    ("C021", "体育（二）", 1, "必修", "教育科学学院"),
    ("C022", "机器学习", 3, "选修", "信息与计算机学院"),
    ("C023", "深度学习", 3, "选修", "信息与计算机学院"),
    ("C024", "自然语言处理", 2, "选修", "信息与计算机学院"),
    ("C025", "计算机视觉", 2, "选修", "信息与计算机学院"),
    ("C026", "大数据技术", 2, "选修", "信息与计算机学院"),
    ("C027", "区块链技术与应用", 2, "选修", "信息与计算机学院"),
    ("C028", "经济学原理", 2, "选修", "经济与管理学院"),
    ("C029", "哲学导论", 2, "选修", "人文与社会科学学院"),
    ("C030", "日语入门", 2, "选修", "外国语学院"),
]


# ---------------------------------------------------------------------------
# Data generation helpers
# ---------------------------------------------------------------------------

def _random_date(start: datetime.date, end: datetime.date) -> datetime.date:
    """Return a random date in [start, end]."""
    delta = (end - start).days
    return start + datetime.timedelta(days=random.randint(0, delta))


def _generate_students():
    """Generate 300 students (S2022001-S2022300)."""
    global students
    students.clear()
    # Build a weighted distribution so each grade-college-major combo exists
    idx = 1
    for grade in GRADE_LEVELS:
        for college_name, majors in COLLEGES:
            # Each college gets 2-3 students per grade for each major
            for major in majors:
                count = random.choice([2, 3])
                for _ in range(count):
                    if idx > 300:
                        break
                    sid = f"S2022{idx:03d}"
                    name_pool = [
                        "张伟", "王芳", "李娜", "刘洋", "陈静",
                        "杨磊", "赵敏", "黄勇", "周杰", "吴秀英",
                        "徐强", "孙丽", "马超", "朱婷", "胡涛",
                        "郭慧", "林峰", "何雪", "高峰", "罗琳",
                        "梁宇", "宋雨", "唐涛", "韩冰", "曹阳",
                        "邓艳", "许鑫", "彭磊", "苏雅", "潘晨",
                    ]
                    gender = random.choice(["男", "女"])
                    students.append({
                        "student_id": sid,
                        "name": random.choice(name_pool),
                        "gender": gender,
                        "grade": grade,
                        "college": college_name,
                        "major": major,
                        "email": f"{sid}@stu.edu.cn",
                        "enrollment_year": grade,
                    })
                    idx += 1
                    if idx > 300:
                        break
            if idx > 300:
                break
        if idx > 300:
            break
    # Ensure we have exactly 300
    while len(students) < 300:
        sid = f"S2022{len(students)+1:03d}"
        students.append({
            "student_id": sid,
            "name": random.choice(["张伟", "王芳", "李娜"]),
            "gender": random.choice(["男", "女"]),
            "grade": 2025,
            "college": "信息与计算机学院",
            "major": "计算机科学与技术",
            "email": f"{sid}@edu.cn",
            "enrollment_year": 2025,
        })


def _generate_books():
    """Generate 50 books (B001-B050)."""
    global books
    books.clear()
    for i, (cls, title, author, summary) in enumerate(BOOK_DATA, 1):
        books.append({
            "book_id": f"B{i:03d}",
            "title": title,
            "author": author,
            "classification": cls,
            "summary": summary,
            "publisher": random.choice([
                "清华大学出版社", "机械工业出版社", "人民邮电出版社",
                "电子工业出版社", "高等教育出版社", "商务印书馆",
                "中信出版社", "科学出版社", "北京大学出版社",
            ]),
            "publish_year": random.randint(2015, 2024),
            "total_copies": random.randint(3, 10),
            "available_copies": random.randint(1, 6),
        })


def _generate_borrow_records():
    """Generate 5000+ borrow records."""
    global borrow_records
    borrow_records.clear()
    start = datetime.date(2024, 9, 1)
    end = datetime.date(2026, 5, 1)
    borrow_id = 1
    for _ in range(5200):
        student = random.choice(students)
        book = random.choice(books)
        borrow_date = _random_date(start, end)
        loan_days = random.randint(1, 90)
        return_date = borrow_date + datetime.timedelta(days=loan_days)
        if return_date > end:
            return_date = None  # not yet returned
        status = "已归还" if return_date else "借出中"
        borrow_records.append({
            "id": borrow_id,
            "student_id": student["student_id"],
            "student_name": student["name"],
            "book_id": book["book_id"],
            "book_title": book["title"],
            "borrow_date": borrow_date.isoformat(),
            "return_date": return_date.isoformat() if return_date else None,
            "status": status,
            "renewal_count": random.randint(0, 2) if status == "已归还" else random.randint(0, 1),
        })
        borrow_id += 1


def _generate_courses():
    """Generate course catalog (30 courses)."""
    global courses
    courses.clear()
    for cid, name, credits, ctype, college in COURSE_DATA:
        courses.append({
            "course_id": cid,
            "course_name": name,
            "credits": credits,
            "type": ctype,
            "college": college,
            "semester": random.choice(["2024-2025-1", "2024-2025-2", "2025-2026-1"]),
            "teacher": random.choice([
                "陈教授", "王教授", "李教授", "张教授", "刘教授",
                "赵副教授", "孙副教授", "周副教授", "吴副教授", "郑老师",
            ]),
        })


def _generate_course_records():
    """Generate 3000+ course enrollment records with grades."""
    global course_records
    course_records.clear()
    for _ in range(3200):
        student = random.choice(students)
        course = random.choice(courses)
        # Grade distribution: mostly clustered around 70-90
        if course["type"] == "必修":
            score = min(98, max(60, int(random.gauss(78, 10))))
        else:
            score = min(98, max(60, int(random.gauss(82, 8))))
        gpa = round((score - 50) / 10, 1)
        if gpa < 1.0:
            gpa = 1.0
        if gpa > 4.0:
            gpa = 4.0
        grade_point = min(4.0, max(1.0, (score - 60) / 10 + 1))
        course_records.append({
            "student_id": student["student_id"],
            "student_name": student["name"],
            "course_id": course["course_id"],
            "course_name": course["course_name"],
            "credits": course["credits"],
            "type": course["type"],
            "score": score,
            "grade_point": round(grade_point, 1),
            "semester": course["semester"],
            "pass_status": "及格" if score >= 60 else "不及格",
        })


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

_DATA_INITIALIZED = False


def init_data():
    """Generate all mock data. Safe to call multiple times."""
    global _DATA_INITIALIZED
    if _DATA_INITIALIZED:
        return
    _generate_students()
    _generate_books()
    _generate_courses()
    _generate_borrow_records()
    _generate_course_records()
    _DATA_INITIALIZED = True


def get_all_students():
    return list(students)


def get_student(student_id: str) -> Optional[dict]:
    for s in students:
        if s["student_id"] == student_id:
            return dict(s)
    return None


def get_all_books():
    return list(books)


def get_book(book_id: str) -> Optional[dict]:
    for b in books:
        if b["book_id"] == book_id:
            return dict(b)
    return None


def get_course_catalog():
    return list(courses)


def get_borrow_records(student_id: Optional[str] = None,
                       start_date: Optional[str] = None,
                       end_date: Optional[str] = None):
    results = borrow_records
    if student_id:
        results = [r for r in results if r["student_id"] == student_id]
    if start_date:
        results = [r for r in results if r["borrow_date"] >= start_date]
    if end_date:
        results = [r for r in results if r["borrow_date"] <= end_date]
    return results


def get_course_records(student_id: Optional[str] = None):
    if student_id:
        return [r for r in course_records if r["student_id"] == student_id]
    return list(course_records)
