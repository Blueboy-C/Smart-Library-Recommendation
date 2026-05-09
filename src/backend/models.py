"""ORM模型定义"""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, Date, DateTime
from .database import Base


class Student(Base):
    __tablename__ = "students"
    student_id = Column(String(32), primary_key=True)
    name = Column(String(64), default="")
    grade = Column(String(16), default="")
    major = Column(String(64), default="")
    gender = Column(String(8), default="")


class Book(Base):
    __tablename__ = "books"
    book_id = Column(String(32), primary_key=True)
    title = Column(String(256), nullable=False)
    author = Column(String(128), default="")
    publisher = Column(String(128), default="")
    publish_year = Column(Integer, default=0)
    clc_number = Column(String(32), default="")
    summary = Column(Text, default="")
    total_copies = Column(Integer, default=1)
    available_copies = Column(Integer, default=1)


class Course(Base):
    __tablename__ = "courses"
    course_id = Column(String(32), primary_key=True)
    course_name = Column(String(128), nullable=False)
    course_type = Column(String(32), default="")
    college = Column(String(64), default="")
    description = Column(Text, default="")
    credits = Column(Integer, default=0)
    semester = Column(String(32), default="")


class BorrowRecord(Base):
    __tablename__ = "borrow_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(32), index=True)
    book_id = Column(String(32), index=True)
    book_title = Column(String(256), default="")
    clc_number = Column(String(32), default="")
    borrow_date = Column(Date)
    return_date = Column(Date)
    renew_count = Column(Integer, default=0)


class CourseRecord(Base):
    __tablename__ = "course_records"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(32), index=True)
    course_id = Column(String(32), index=True)
    course_name = Column(String(128), default="")
    course_type = Column(String(32), default="")
    college = Column(String(64), default="")
    score = Column(Float, default=0.0)
    semester = Column(String(32), default="")


class BehaviorLog(Base):
    __tablename__ = "behavior_logs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    student_id = Column(String(32), index=True)
    item_id = Column(String(32), index=True)
    action_type = Column(String(32))
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String(32), default="")
    stay_seconds = Column(Float, default=0.0)
    scroll_percent = Column(Float, default=0.0)
