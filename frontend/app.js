const API_URL = "http://127.0.0.1:8000";


let applicationsCache = [];

let currentEditingId = null;



// ==============================
// 获取页面元素
// ==============================

const modal =
    document.getElementById("applicationModal");

const detailModal =
    document.getElementById("detailModal");


const addButton =
    document.getElementById("addButton");

const closeModalButton =
    document.getElementById("closeModalButton");

const closeDetailButton =
    document.getElementById("closeDetailButton");

const cancelButton =
    document.getElementById("cancelButton");

const applicationForm =
    document.getElementById("applicationForm");


const modalTitle =
    document.getElementById("modalTitle");

const modalSubtitle =
    document.getElementById("modalSubtitle");

const submitButton =
    document.getElementById("submitButton");


const searchInput =
    document.getElementById("searchInput");

const statusFilter =
    document.getElementById("statusFilter");

const sortSelect =
    document.getElementById("sortSelect");


// ==============================
// 页面启动
// ==============================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadApplications();

    }
);



// ==============================
// 日期工具
// ==============================

function getToday() {

    return new Date()
        .toISOString()
        .split("T")[0];

}



// ==============================
// 格式化时间
// ==============================

function formatDateTime(value) {

    if (!value) {
        return "-";
    }

    return value
        .replace("T", " ")
        .slice(0, 19);

}



// ==============================
// 防止 HTML 注入
// ==============================

function escapeHtml(value) {

    const text =
        String(value ?? "");

    return text
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



// ==============================
// 打开新增投递
// ==============================

addButton.addEventListener(
    "click",
    () => {

        currentEditingId = null;

        applicationForm.reset();


        document
            .getElementById("applyDate")
            .value = getToday();


        document
            .getElementById("status")
            .value = "已投递";


        modalTitle.textContent =
            "新增投递";

        modalSubtitle.textContent =
            "记录一条新的实习申请";

        submitButton.textContent =
            "保存投递";


        modal.classList.add("show");

    }
);



// ==============================
// 打开编辑投递
// ==============================

function openEditModal(applicationId) {

    const application =
        applicationsCache.find(
            item =>
                item.id === applicationId
        );


    if (!application) {
        return;
    }


    currentEditingId =
        applicationId;


    document
        .getElementById("company")
        .value =
            application.company || "";


    document
        .getElementById("position")
        .value =
            application.position || "";


    document
        .getElementById("category")
        .value =
            application.category || "";


    document
        .getElementById("city")
        .value =
            application.city || "";


    document
        .getElementById("status")
        .value =
            application.status || "已投递";


    document
        .getElementById("source")
        .value =
            application.source || "";


    document
        .getElementById("jobUrl")
        .value =
            application.job_url || "";


    document
        .getElementById("applyDate")
        .value =
            application.apply_date || getToday();


    document
        .getElementById("notes")
        .value =
            application.notes || "";


    modalTitle.textContent =
        "编辑投递";

    modalSubtitle.textContent =
        "修改实习申请信息和求职进度";

    submitButton.textContent =
        "保存修改";


    modal.classList.add("show");

}



// ==============================
// 打开投递详情
// ==============================

function openDetailModal(applicationId) {

    const application =
        applicationsCache.find(
            item =>
                item.id === applicationId
        );


    if (!application) {
        return;
    }


    document
        .getElementById("detailCompany")
        .textContent =
            application.company || "-";


    document
        .getElementById("detailPosition")
        .textContent =
            application.position || "-";


    document
        .getElementById("detailCategory")
        .textContent =
            application.category || "-";


    document
        .getElementById("detailCity")
        .textContent =
            application.city || "-";


    const detailStatus =
        document.getElementById(
            "detailStatus"
        );


    detailStatus.innerHTML = "";


    const statusBadge =
        document.createElement("span");


    statusBadge.className =
        `status ${getStatusClass(
            application.status
        )}`;


    statusBadge.textContent =
        application.status || "-";


    detailStatus.appendChild(
        statusBadge
    );


    document
        .getElementById("detailApplyDate")
        .textContent =
            application.apply_date || "-";


    document
        .getElementById("detailSource")
        .textContent =
            application.source || "-";


    document
        .getElementById("detailNotes")
        .textContent =
            application.notes || "暂无备注";


    document
        .getElementById("detailCreatedAt")
        .textContent =
            formatDateTime(
                application.created_at
            );


    document
        .getElementById("detailUpdatedAt")
        .textContent =
            formatDateTime(
                application.updated_at
            );


    const jobUrl =
        document.getElementById(
            "detailJobUrl"
        );


    if (application.job_url) {

        jobUrl.textContent =
            application.job_url;

        jobUrl.href =
            application.job_url;

        jobUrl.style.pointerEvents =
            "auto";

    } else {

        jobUrl.textContent =
            "未填写";

        jobUrl.removeAttribute("href");

        jobUrl.style.pointerEvents =
            "none";

    }


    detailModal.classList.add("show");

}



// ==============================
// 关闭新增 / 编辑弹窗
// ==============================

function closeModal() {

    modal.classList.remove("show");

}



// ==============================
// 关闭详情弹窗
// ==============================

function closeDetailModal() {

    detailModal.classList.remove("show");

}



closeModalButton.addEventListener(
    "click",
    closeModal
);


cancelButton.addEventListener(
    "click",
    closeModal
);


closeDetailButton.addEventListener(
    "click",
    closeDetailModal
);



modal.addEventListener(
    "click",
    event => {

        if (event.target === modal) {

            closeModal();

        }

    }
);



detailModal.addEventListener(
    "click",
    event => {

        if (event.target === detailModal) {

            closeDetailModal();

        }

    }
);



// ==============================
// ESC 关闭弹窗
// ==============================

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {

            closeModal();

            closeDetailModal();

        }

    }
);



// ==============================
// 搜索与筛选
// ==============================

searchInput.addEventListener(
    "input",
    applyFilters
);


statusFilter.addEventListener(
    "change",
    applyFilters
);



// ==============================
// 读取数据库数据
// ==============================

async function loadApplications() {

    // 请求数据前先显示加载状态
    showLoadingState();


    try {

        const response =
            await fetch(
                `${API_URL}/applications`
            );


        if (!response.ok) {

            throw new Error(
                "获取投递记录失败"
            );

        }


        const applications =
            await response.json();


        // 保存所有原始数据
        applicationsCache =
            applications;


        // 更新 Dashboard
        updateStatistics(
            applications
        );


        // 根据当前搜索、筛选、排序重新渲染
        applyFilters();


    } catch (error) {

        console.error(
            "加载数据失败：",
            error
        );


        showLoadError();

    }

}



// ==============================
// 搜索 + 状态筛选
// ==============================

function applyFilters() {

    const keyword =
        searchInput
            .value
            .trim()
            .toLowerCase();


    const selectedStatus =
        statusFilter.value;


    const sortMode =
        sortSelect.value;


    let result =
        applicationsCache.filter(
            application => {

                const company =
                    (
                        application.company
                        || ""
                    )
                    .toLowerCase();


                const position =
                    (
                        application.position
                        || ""
                    )
                    .toLowerCase();


                const matchKeyword =
                    company.includes(keyword)
                    ||
                    position.includes(keyword);


                const matchStatus =
                    selectedStatus === "全部"
                    ||
                    application.status
                    === selectedStatus;


                return (
                    matchKeyword
                    &&
                    matchStatus
                );

            }
        );


    // 不直接修改原始缓存
    result = [...result];


    // ==========================
    // 排序
    // ==========================

    result.sort(
        (a, b) => {

            switch (sortMode) {

                // 投递日期：最新优先
                case "apply_desc":

                    return String(
                        b.apply_date || ""
                    ).localeCompare(
                        String(
                            a.apply_date || ""
                        )
                    );


                // 投递日期：最早优先
                case "apply_asc":

                    return String(
                        a.apply_date || ""
                    ).localeCompare(
                        String(
                            b.apply_date || ""
                        )
                    );


                // 最近更新时间
                case "updated_desc":

                    return String(
                        b.updated_at || ""
                    ).localeCompare(
                        String(
                            a.updated_at || ""
                        )
                    );


                // 公司名称
                case "company_asc":

                    return String(
                        a.company || ""
                    ).localeCompare(
                        String(
                            b.company || ""
                        ),
                        "zh-CN"
                    );


                default:

                    return 0;
            }

        }
    );


    renderApplications(result);
}


// ==============================
// 渲染表格
// ==============================

function renderApplications(
    applications
) {

    const table =
        document.getElementById(
            "applicationTable"
        );


    table.innerHTML = "";


    // ==============================
    // 情况 1：数据库本身没有任何记录
    // ==============================

    if (
        applicationsCache.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-cell"
                >

                    <div class="empty-state">

                        <div class="empty-icon">
                            📋
                        </div>

                        <div class="empty-title">
                            暂无投递记录
                        </div>

                        <div class="empty-description">
                            点击右上角“新增投递”，开始记录你的第一条实习申请。
                        </div>

                    </div>

                </td>

            </tr>
        `;

        return;
    }


    // ==============================
    // 情况 2：有数据，但搜索 / 筛选没有结果
    // ==============================

    if (
        applications.length === 0
    ) {

        table.innerHTML = `

            <tr>

                <td
                    colspan="8"
                    class="empty-cell"
                >

                    <div class="empty-state">

                        <div class="empty-icon">
                            🔍
                        </div>

                        <div class="empty-title">
                            没有找到符合条件的投递记录
                        </div>

                        <div class="empty-description">
                            尝试更换关键词或状态筛选条件。
                        </div>

                        <button
                            class="clear-filter-button"
                            onclick="clearFilters()"
                        >
                            清除筛选
                        </button>

                    </div>

                </td>

            </tr>
        `;

        return;
    }


    // ==============================
    // 正常渲染投递数据
    // ==============================

    applications.forEach(
        application => {

            const row =
                document.createElement(
                    "tr"
                );


            row.innerHTML = `

                <td>
                    ${escapeHtml(
                        application.company || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.position || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.category || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.city || "-"
                    )}
                </td>


                <td>

                    <select
                        class="
                            quick-status-select
                            ${getStatusClass(
                                application.status
                            )}
                        "

                        onchange="
                            updateApplicationStatus(
                                ${application.id},
                                this.value
                            )
                        "
                    >

                        <option
                            value="已投递"
                            ${
                                application.status === "已投递"
                                    ? "selected"
                                    : ""
                            }
                        >
                            已投递
                        </option>


                        <option
                            value="面试中"
                            ${
                                application.status === "面试中"
                                    ? "selected"
                                    : ""
                            }
                        >
                            面试中
                        </option>


                        <option
                            value="已录用"
                            ${
                                application.status === "已录用"
                                    ? "selected"
                                    : ""
                            }
                        >
                            已录用
                        </option>


                        <option
                            value="已拒绝"
                            ${
                                application.status === "已拒绝"
                                    ? "selected"
                                    : ""
                            }
                        >
                            已拒绝
                        </option>

                    </select>

                </td>


                <td>
                    ${escapeHtml(
                        application.apply_date || "-"
                    )}
                </td>


                <td>
                    ${escapeHtml(
                        application.source || "-"
                    )}
                </td>


                <td>

                    <button
                        class="
                            action-button
                            detail-button
                        "
                        onclick="
                            openDetailModal(
                                ${application.id}
                            )
                        "
                    >
                        详情
                    </button>


                    <button
                        class="
                            action-button
                            edit-button
                        "
                        onclick="
                            openEditModal(
                                ${application.id}
                            )
                        "
                    >
                        编辑
                    </button>


                    <button
                        class="
                            action-button
                            delete-button
                        "
                        onclick="
                            deleteApplication(
                                ${application.id}
                            )
                        "
                    >
                        删除
                    </button>

                </td>
            `;


            table.appendChild(
                row
            );

        }
    );

}



// ==============================
// Dashboard 统计
// ==============================

function updateStatistics(
    applications
) {

    document
        .getElementById(
            "totalCount"
        )
        .textContent =
            applications.length;


    document
        .getElementById(
            "appliedCount"
        )
        .textContent =
            applications.filter(
                item =>
                    item.status
                    === "已投递"
            ).length;


    document
        .getElementById(
            "interviewCount"
        )
        .textContent =
            applications.filter(
                item =>
                    item.status
                    === "面试中"
            ).length;


    document
        .getElementById(
            "offerCount"
        )
        .textContent =
            applications.filter(
                item =>
                    item.status
                    === "已录用"
            ).length;


    document
        .getElementById(
            "rejectedCount"
        )
        .textContent =
            applications.filter(
                item =>
                    item.status
                    === "已拒绝"
            ).length;

}



// ==============================
// 状态对应颜色
// ==============================

function getStatusClass(status) {

    switch (status) {

        case "已投递":

            return "status-applied";


        case "面试中":

            return "status-interview";


        case "已录用":

            return "status-offer";


        case "已拒绝":

            return "status-rejected";


        default:

            return "";

    }

}



// ==============================
// 新增 / 编辑保存
// ==============================

applicationForm.addEventListener(
    "submit",
    async event => {

        event.preventDefault();


        const applicationData = {

            company:
                document
                    .getElementById(
                        "company"
                    )
                    .value
                    .trim(),


            position:
                document
                    .getElementById(
                        "position"
                    )
                    .value
                    .trim(),


            category:
                document
                    .getElementById(
                        "category"
                    )
                    .value
                    .trim(),


            city:
                document
                    .getElementById(
                        "city"
                    )
                    .value
                    .trim(),


            status:
                document
                    .getElementById(
                        "status"
                    )
                    .value,


            source:
                document
                    .getElementById(
                        "source"
                    )
                    .value
                    .trim(),


            job_url:
                document
                    .getElementById(
                        "jobUrl"
                    )
                    .value
                    .trim(),


            apply_date:
                document
                    .getElementById(
                        "applyDate"
                    )
                    .value,


            notes:
                document
                    .getElementById(
                        "notes"
                    )
                    .value
                    .trim()

        };


        const isEditing =
            currentEditingId !== null;


        const requestUrl =
            isEditing
                ? `${API_URL}/applications/${currentEditingId}`
                : `${API_URL}/applications`;


        const requestMethod =
            isEditing
                ? "PUT"
                : "POST";


        try {

            const response =
                await fetch(
                    requestUrl,
                    {
                        method:
                            requestMethod,

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                applicationData
                            )
                    }
                );


            if (!response.ok) {

                throw new Error(
                    "保存投递失败"
                );

            }


            applicationForm.reset();


            currentEditingId =
                null;


            closeModal();


            await loadApplications();


            showToast(
    isEditing
        ? "投递记录已更新"
        : "投递记录创建成功"
);

        } catch (error) {

            console.error(
                "保存失败：",
                error
            );


showToast(
    "保存失败，请检查后端服务",
    "error"
);

        }

    }
);



// ==============================
// 删除投递
// ==============================

async function deleteApplication(
    applicationId
) {

    const confirmed =
        confirm(
            "确定要删除这条投递记录吗？"
        );


    if (!confirmed) {

        return;

    }


    try {

        const response =
            await fetch(
                `${API_URL}/applications/${applicationId}`,
                {
                    method:
                        "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "删除失败"
            );

        }


        await loadApplications();
showToast(
    "投递记录已删除"
);

    } catch (error) {

        console.error(
            "删除投递失败：",
            error
        );


        alert(
            "删除失败，请检查后端服务。"
        );

    }

}
// ==============================
// 快速修改投递状态
// ==============================

async function updateApplicationStatus(
    applicationId,
    newStatus
) {

    const application =
        applicationsCache.find(
            item =>
                item.id === applicationId
        );


    if (!application) {
        return;
    }


    if (
        application.status
        === newStatus
    ) {
        return;
    }


    const applicationData = {

        company:
            application.company,

        position:
            application.position,

        category:
            application.category || "",

        city:
            application.city || "",

        status:
            newStatus,

        source:
            application.source || "",

        job_url:
            application.job_url || "",

        apply_date:
            application.apply_date,

        notes:
            application.notes || ""

    };


    try {

        const response =
            await fetch(
                `${API_URL}/applications/${applicationId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            applicationData
                        )
                }
            );


        if (!response.ok) {

            throw new Error(
                "状态更新失败"
            );

        }


        // 重新读取数据库
        await loadApplications();
showToast(
    "投递状态更新成功"
);

    } catch (error) {

        console.error(
            "更新状态失败：",
            error
        );


        alert(
            "状态修改失败，请检查后端服务。"
        );


        // 恢复数据库真实状态
        await loadApplications();

    }

}
// ==============================
// Toast 操作提示
// ==============================

let toastTimer = null;


function showToast(
    message,
    type = "success"
) {

    const toast =
        document.getElementById("toast");


    toast.textContent = message;


    toast.className =
        `toast ${
            type === "error"
                ? "toast-error"
                : "toast-success"
        } show`;


    if (toastTimer) {
        clearTimeout(toastTimer);
    }


    toastTimer = setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        2500
    );
}
// ==============================
// 表格加载状态
// ==============================

function showLoadingState() {

    const table =
        document.getElementById(
            "applicationTable"
        );


    table.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="empty-cell"
            >

                <div class="loading-state">

                    <div class="loading-spinner"></div>

                    <div>
                        正在加载投递记录...
                    </div>

                </div>

            </td>

        </tr>
    `;

}



// ==============================
// 数据加载失败状态
// ==============================

function showLoadError() {

    const table =
        document.getElementById(
            "applicationTable"
        );


    table.innerHTML = `

        <tr>

            <td
                colspan="8"
                class="empty-cell"
            >

                <div class="empty-state">

                    <div class="empty-icon">
                        ⚠️
                    </div>

                    <div class="empty-title">
                        数据加载失败
                    </div>

                    <div class="empty-description">
                        请确认 FastAPI 后端服务正在运行。
                    </div>

                    <button
                        class="clear-filter-button"
                        onclick="loadApplications()"
                    >
                        重新加载
                    </button>

                </div>

            </td>

        </tr>
    `;

}



// ==============================
// 清除搜索与筛选
// ==============================

function clearFilters() {

    searchInput.value = "";

    statusFilter.value =
        "全部";

    sortSelect.value =
        "apply_desc";


    applyFilters();

}