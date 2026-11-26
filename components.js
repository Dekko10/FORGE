
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
            close: "×",
            video: "▷",
            document: "▤",
            github: "⌘",
            download: "↓",
            external: "↗",
            lightbulb: "✧",
            warning: "!",
            terminal: ">_"
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

        return `
            <button
                type="${this.escapeHTML(type)}"
                class="btn btn-${this.escapeHTML(variant)}"
                ${attributes}
            >
                ${icon ? `<span class="btn-icon">${this.icon(icon)}</span>` : ""}
                <span>${this.escapeHTML(text)}</span>
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
        const value = Math.min(
            100,
            Math.max(0, Number(percentage) || 0)
        );

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

        return `
            <article class="module-card"
                data-module-id="${this.escapeHTML(module.id)}">

                <div class="module-card-top">
                    <div class="module-icon">${this.icon("code")}</div>
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
                        ${Number(stats.completed) || 0}
                        de ${Number(stats.total) || 0}
                        puntos completados
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

    // ENCABEZADO DE UNA CLASE

    lessonHeader(lesson, moduleName = "") {
        return `
            <header class="lesson-header">
                <div class="lesson-breadcrumb">
                    ${this.escapeHTML(moduleName)}
                    <span> / </span>
                    ${this.escapeHTML(lesson.title || "Clase")}
                </div>

                ${lesson.level
                    ? this.badge(lesson.level, "info")
                    : ""
                }

                <h1>${this.escapeHTML(lesson.title || "")}</h1>

                <p class="lesson-description">
                    ${this.escapeHTML(lesson.description || "")}
                </p>

                <div class="lesson-meta">
                    ${
                        lesson.duration
                            ? `<span>${this.icon("clock")} ${this.escapeHTML(lesson.duration)}</span>`
                            : ""
                    }

                    ${
                        lesson.difficulty
                            ? `<span>${this.escapeHTML(lesson.difficulty)}</span>`
                            : ""
                    }
                </div>
            </header>
        `;
    }

    // OBJETIVOS DE APRENDIZAJE

    renderObjectives(objectives = []) {
        if (!objectives.length) return "";

        return `
            <section class="lesson-section objectives-section">
                <h2>Objetivos de aprendizaje</h2>

                <p>Al terminar esta clase deberás poder:</p>

                <ul class="lesson-list">
                    ${objectives.map(objective => `
                        <li>${this.escapeHTML(objective)}</li>
                    `).join("")}
                </ul>
            </section>
        `;
    }

    // TEXTO Y EXPLICACIONES

    renderContent(content = []) {
        if (!content.length) return "";

        return content.map(block => {
            switch (block.type) {
                case "heading":
                    return `
                        <h3 class="lesson-subheading">
                            ${this.escapeHTML(block.text)}
                        </h3>
                    `;

                case "paragraph":
                    return `
                        <p class="lesson-paragraph">
                            ${this.escapeHTML(block.text)}
                        </p>
                    `;

                case "list":
                    return `
                        <ul class="lesson-list">
                            ${(block.items || []).map(item => `
                                <li>${this.escapeHTML(item)}</li>
                            `).join("")}
                        </ul>
                    `;

                case "ordered-list":
                    return `
                        <ol class="lesson-list">
                            ${(block.items || []).map(item => `
                                <li>${this.escapeHTML(item)}</li>
                            `).join("")}
                        </ol>
                    `;

                case "code":
                    return this.codeBlock(block.code, block.language);

                case "callout":
                    return this.callout(
                        block.title,
                        block.text,
                        block.variant
                    );

                case "image":
                    if (!block.url) return "";

                    return `
                        <figure class="lesson-image">
                            <img
                                src="${this.escapeHTML(block.url)}"
                                alt="${this.escapeHTML(block.alt || "")}"
                                loading="lazy"
                            >
                            ${
                                block.caption
                                    ? `<figcaption>${this.escapeHTML(block.caption)}</figcaption>`
                                    : ""
                            }
                        </figure>
                    `;

                default:
                    return "";
            }
        }).join("");
    }

    // BLOQUES DE CÓDIGO

    codeBlock(code = "", language = "text") {
        const safeLanguage = this.escapeHTML(language);

        return `
            <div class="code-example">
                <div class="code-example-header">
                    <span>${safeLanguage}</span>

                    <button
                        type="button"
                        class="btn btn-ghost"
                        data-copy-code
                    >
                        Copiar código
                    </button>
                </div>

                <pre><code class="language-${safeLanguage}">${this.escapeHTML(code)}</code></pre>
            </div>
        `;
    }

    // CONCEPTOS Y ADVERTENCIAS

    callout(title, text, variant = "info") {
        const allowed = ["info", "warning", "success", "important"];

        const type = allowed.includes(variant)
            ? variant
            : "info";

        return `
            <aside class="lesson-callout callout-${type}">
                <strong>${this.escapeHTML(title || "Nota")}</strong>
                <p>${this.escapeHTML(text || "")}</p>
            </aside>
        `;
    }

    // RECURSOS EXTERNOS

    resourceCard(resource) {
        const types = {
            documentation: {
                label: "Documentación",
                icon: "document"
            },
            video: {
                label: "Video",
                icon: "video"
            },
            pdf: {
                label: "PDF",
                icon: "download"
            },
            github: {
                label: "Repositorio",
                icon: "github"
            },
            article: {
                label: "Artículo",
                icon: "book"
            },
            course: {
                label: "Curso",
                icon: "play"
            },
            book: {
                label: "Libro",
                icon: "book"
            }
        };

        const type = types[resource.type] || {
            label: "Recurso",
            icon: "external"
        };

        const url = resource.url || "#";

        const isValidUrl = /^https?:\/\//i.test(url);

        return `
            <article class="resource-card">
                <div class="resource-icon">
                    ${this.icon(type.icon)}
                </div>

                <div class="resource-content">
                    <div class="resource-tags">
                        ${this.badge(type.label)}
                        ${
                            resource.language
                                ? this.badge(resource.language, "info")
                                : ""
                        }
                        ${
                            resource.free
                                ? this.badge("Gratuito", "success")
                                : ""
                        }
                    </div>

                    <h3>${this.escapeHTML(resource.title || "Recurso")}</h3>

                    <p>
                        ${this.escapeHTML(resource.description || "")}
                    </p>

                    ${
                        resource.subtitles
                            ? `<small>Subtítulos: ${this.escapeHTML(resource.subtitles)}</small>`
                            : ""
                    }

                    ${
                        isValidUrl
                            ? `<a href="${this.escapeHTML(url)}"
                                target="_blank"
                                rel="noopener noreferrer">
                                Abrir recurso ${this.icon("external")}
                            </a>`
                            : `<span class="resource-unavailable">Enlace no disponible</span>`
                    }
                </div>
            </article>
        `;
    }

    renderResources(resources = []) {
        if (!resources.length) {
            return this.emptyState(
                "Sin recursos adicionales",
                "Todavía no se han agregado materiales para esta clase.",
                "book"
            );
        }

        return `
            <div class="resources-grid">
                ${resources.map(resource => this.resourceCard(resource)).join("")}
            </div>
        `;
    }

    // EJERCICIOS PRÁCTICOS

    renderExercises(exercises = []) {
        if (!exercises.length) {
            return this.emptyState(
                "No hay ejercicios disponibles",
                "Próximamente encontrarás actividades para practicar.",
                "code"
            );
        }

        return `
            <div class="exercises-list">
                ${exercises.map((exercise, index) => `
                    <article class="exercise-card">
                        <div class="exercise-heading">
                            <span class="exercise-number">
                                Reto ${index + 1}
                            </span>

                            ${
                                exercise.difficulty
                                    ? this.badge(exercise.difficulty, "info")
                                    : ""
                            }
                        </div>

                        <h3>${this.escapeHTML(exercise.title || "")}</h3>

                        <p>${this.escapeHTML(exercise.statement || "")}</p>

                        ${
                            exercise.hint
                                ? `
                                    <details class="exercise-hint">
                                        <summary>Ver pista</summary>
                                        <p>${this.escapeHTML(exercise.hint)}</p>
                                    </details>
                                `
                                : ""
                        }

                        ${
                            exercise.expectedResult
                                ? `
                                    <details class="exercise-answer">
                                        <summary>Ver resultado esperado</summary>
                                        <p>${this.escapeHTML(exercise.expectedResult)}</p>
                                    </details>
                                `
                                : ""
                        }
                    </article>
                `).join("")}
            </div>
        `;
    }

    // EVALUACIONES

    renderQuiz(questions = []) {
        if (!questions.length) {
            return this.emptyState(
                "Evaluación no disponible",
                "Esta clase todavía no tiene preguntas de evaluación.",
                "target"
            );
        }

        return `
            <form class="lesson-quiz" data-lesson-quiz>
                ${questions.map((question, index) => `
                    <fieldset class="quiz-question">
                        <legend>
                            ${index + 1}. ${this.escapeHTML(question.question)}
                        </legend>

                        ${(question.options || []).map((option, optionIndex) => `
                            <label class="quiz-option">
                                <input
                                    type="radio"
                                    name="question-${index}"
                                    value="${optionIndex}"
                                    required
                                >

                                <span>${this.escapeHTML(option)}</span>
                            </label>
                        `).join("")}
                    </fieldset>
                `).join("")}

                <button class="btn btn-primary" type="submit">
                    Comprobar respuestas
                </button>
            </form>
        `;
    }

    // CLASE COMPLETA

    renderLesson(lesson, moduleName = "") {
        return `
            <article class="lesson-container">

                ${this.lessonHeader(lesson, moduleName)}

                ${this.renderObjectives(lesson.objectives || [])}

                <section class="lesson-section">
                    <h2>Clase</h2>

                    ${this.renderContent(lesson.content || [])}
                </section>

                ${
                    lesson.keyConcepts?.length
                        ? `
                            <section class="lesson-section">
                                <h2>Conceptos importantes</h2>

                                <div class="concepts-grid">
                                    ${lesson.keyConcepts.map(concept => `
                                        <article class="concept-card">
                                            <h3>${this.escapeHTML(concept.title)}</h3>
                                            <p>${this.escapeHTML(concept.description)}</p>
                                        </article>
                                    `).join("")}
                                </div>
                            </section>
                        `
                        : ""
                }

                ${
                    lesson.resources?.length
                        ? `
                            <section class="lesson-section">
                                <h2>Material de estudio</h2>
                                ${this.renderResources(lesson.resources)}
                            </section>
                        `
                        : ""
                }

                ${
                    lesson.exercises?.length
                        ? `
                            <section class="lesson-section">
                                <h2>Práctica</h2>
                                ${this.renderExercises(lesson.exercises)}
                            </section>
                        `
                        : ""
                }

                ${
                    lesson.quiz?.length
                        ? `
                            <section class="lesson-section">
                                <h2>Evaluación</h2>
                                <p>Comprueba lo que has aprendido.</p>
                                ${this.renderQuiz(lesson.quiz)}
                            </section>
                        `
                        : ""
                }

            </article>
        `;
    }

    // NOTIFICACIONES

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
