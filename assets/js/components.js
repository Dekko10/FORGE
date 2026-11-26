
class ForgeComponents {
    escapeHTML(value = "") {
        return String(value).replace(/[&<>"']/g, character => {
            const entities = {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#039;"
            };

            return entities[character];
        });
    }

    icon(name) {
        const icons = {
            code: "⌘",
            book: "▤",
            folder: "▣",
            chart: "▥",
            search: "⌕",
            check: "✓",
            clock: "◷",
            plus: "+",
            arrow: "→",
            lock: "▣",
            target: "◎",
            settings: "⚙",
            star: "✦",
            play: "▶",
            menu: "☰",
            close: "×"
        };

        return icons[name] || "•";
    }

    button(text, options = {}) {
        const {
            type = "button",
            variant = "secondary",
            icon = null,
            attributes = ""
        } = options;

        const safeText = this.escapeHTML(text);
        const safeAttributes = attributes;

        return `
            <button
                type="${type}"
                class="btn btn-${variant}"
                ${safeAttributes}
            >
                ${icon ? `<span class="btn-icon">${this.icon(icon)}</span>` : ""}
                <span>${safeText}</span>
            </button>
        `;
    }

    badge(text, variant = "default") {
        return `
            <span class="badge badge-${this.escapeHTML(variant)}">
                ${this.escapeHTML(text)}
            </span>
        `;
    }

    progressBar(percentage = 0) {
        const value = Math.min(100, Math.max(0, Number(percentage) || 0));

        return `
            <div
                class="progress-track"
                role="progressbar"
                aria-valuenow="${value}"
                aria-valuemin="0"
                aria-valuemax="100"
            >
                <div
                    class="progress-fill"
                    style="width: ${value}%"
                ></div>
            </div>
        `;
    }

    statCard(title, value, description = "", icon = "chart") {
        return `
            <article class="stat-card">
                <div class="stat-card-header">
                    <span class="stat-icon">${this.icon(icon)}</span>
                    <span class="stat-label">
                        ${this.escapeHTML(title)}
                    </span>
                </div>

                <div class="stat-value">
                    ${this.escapeHTML(value)}
                </div>

                <p class="stat-description">
                    ${this.escapeHTML(description)}
                </p>
            </article>
        `;
    }

    emptyState(title, description, icon = "folder") {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">
                    ${this.icon(icon)}
                </div>

                <h3>${this.escapeHTML(title)}</h3>

                <p>${this.escapeHTML(description)}</p>
            </div>
        `;
    }

    moduleCard(module, stats = {}) {
        const name = this.escapeHTML(module.name || "Sin nombre");
        const description = this.escapeHTML(
            module.description || "Sin descripción"
        );

        const category = this.escapeHTML(
            module.category || "General"
        );

        const percentage = Math.min(
            100,
            Math.max(0, Number(stats.percentage) || 0)
        );

        const completed = Number(stats.completed) || 0;
        const total = Number(stats.total) || 0;

        return `
            <article class="module-card" data-module-id="${this.escapeHTML(module.id)}">
                <div class="module-card-top">
                    <div class="module-icon">
                        ${this.icon("code")}
                    </div>

                    ${this.badge(category)}
                </div>

                <div class="module-card-content">
                    <h3>${name}</h3>
                    <p>${description}</p>
                </div>

                <div class="module-card-progress">
                    <div class="progress-info">
                        <span>Progreso</span>
                        <span>${percentage}%</span>
                    </div>

                    ${this.progressBar(percentage)}

                    <span class="progress-detail">
                        ${completed} de ${total} puntos completados
                    </span>
                </div>

                <button
                    class="btn btn-secondary btn-block"
                    type="button"
                    data-open-module="${this.escapeHTML(module.id)}"
                >
                    Continuar
                    <span class="btn-icon">${this.icon("arrow")}</span>
                </button>
            </article>
        `;
    }

    sectionHeader(title, description = "", action = "") {
        return `
            <div class="section-header">
                <div>
                    <h2>${this.escapeHTML(title)}</h2>
                    <p>${this.escapeHTML(description)}</p>
                </div>

                <div class="section-header-action">
                    ${action}
                </div>
            </div>
        `;
    }

    checklistItem(point, completed = false) {
        return `
            <label class="checklist-item ${completed ? "completed" : ""}">
                <input
                    type="checkbox"
                    data-point-id="${this.escapeHTML(point.id)}"
                    ${completed ? "checked" : ""}
                >

                <span class="checklist-check"></span>

                <span class="checklist-content">
                    <strong>${this.escapeHTML(point.title)}</strong>
                    ${
                        point.description
                            ? `<small>${this.escapeHTML(point.description)}</small>`
                            : ""
                    }
                </span>
            </label>
        `;
    }

    toast(message, type = "success") {
        let container = document.getElementById("toast-container");

        if (!container) {
            container = document.createElement("div");
            container.id = "toast-container";
            container.className = "toast-container";
            document.body.appendChild(container);
        }

        const toast = document.createElement("div");

        toast.className = `toast toast-${type}`;
        toast.textContent = message;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();

            if (container.children.length === 0) {
                container.remove();
            }
        }, 3000);
    }
}

const components = new ForgeComponents();

export default components;
