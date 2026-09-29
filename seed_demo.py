import json
import urllib.request
import urllib.error


API_URL = "http://127.0.0.1:8000/applications"


demo_applications = [
    {
        "company": "阿里巴巴",
        "position": "Java 后端开发实习生",
        "category": "技术",
        "city": "杭州",
        "status": "已投递",
        "source": "官网",
        "job_url": "",
        "apply_date": "2026-09-26",
        "notes": "已完成网申，等待后续通知。"
    },
    {
        "company": "美团",
        "position": "数据开发实习生",
        "category": "技术",
        "city": "北京",
        "status": "面试中",
        "source": "Boss直聘",
        "job_url": "",
        "apply_date": "2026-09-24",
        "notes": "已完成一面，等待二面安排。"
    },
    {
        "company": "华为",
        "position": "软件开发实习生",
        "category": "技术",
        "city": "深圳",
        "status": "已投递",
        "source": "官网",
        "job_url": "",
        "apply_date": "2026-09-22",
        "notes": "通过校园招聘官网投递。"
    },
    {
        "company": "小红书",
        "position": "后端开发实习生",
        "category": "技术",
        "city": "上海",
        "status": "已拒绝",
        "source": "实习僧",
        "job_url": "",
        "apply_date": "2026-09-20",
        "notes": "流程已结束，用于记录和复盘。"
    },
    {
        "company": "京东",
        "position": "算法工程实习生",
        "category": "算法",
        "city": "北京",
        "status": "面试中",
        "source": "官网",
        "job_url": "",
        "apply_date": "2026-09-18",
        "notes": "已进入技术面试阶段。"
    },
    {
        "company": "网易",
        "position": "服务端开发实习生",
        "category": "技术",
        "city": "广州",
        "status": "已投递",
        "source": "官网",
        "job_url": "",
        "apply_date": "2026-09-16",
        "notes": "已完成简历投递。"
    }
]


def create_application(application):
    data = json.dumps(
        application,
        ensure_ascii=False
    ).encode("utf-8")

    request = urllib.request.Request(
        API_URL,
        data=data,
        headers={
            "Content-Type": "application/json"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(request) as response:
            result = json.loads(
                response.read().decode("utf-8")
            )

            print(
                f"✅ 添加成功："
                f"{result['company']} - "
                f"{result['position']}"
            )

    except urllib.error.HTTPError as error:
        print(
            f"❌ 添加失败："
            f"{application['company']} "
            f"HTTP {error.code}"
        )

        print(
            error.read().decode("utf-8")
        )

    except urllib.error.URLError:
        print(
            "❌ 无法连接 FastAPI 后端，"
            "请确认 127.0.0.1:8000 正在运行。"
        )

        raise


def main():
    print("开始写入 InternTrack 演示数据...\n")

    for application in demo_applications:
        create_application(application)

    print("\n🎉 演示数据写入完成！")


if __name__ == "__main__":
    main()