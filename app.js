
import router from "./router.js";
import modules from "./modules.js";
import storage from "./storage.js";

const app = document.getElementById("app");

let currentModuleId = null;
let currentLessonId = null;

const escapeHTML = value => {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
};

const safeUrl = value => {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol)
      ? url.href
      : "#";
  } catch {
    return "#";
  }
};

const getAllModules = () => modules.getAll();

const getModule = () => modules.getById(currentModuleId);

const getLesson = () => modules.getLesson(
  currentModuleId,
  currentLessonId
);

function notify(message) {
  if (typeof window.showToast === "function") {
    window.showToast(message);
    return;
  }

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 3000);
}

function setPage(title, content) {
  if (!app) return;

  app.innerHTML = `
    <div class="page-heading">
      <h1>${escapeHTML(title)}</h1>
    </div>
    ${content}
  `;

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

function renderEmpty(title, description) {
  return `
    <div class="empty-state">
      <h3>${escapeHTML(title)}</h3>
      <p>${escapeHTML(description)}</p>
    </div>
  `;
}

function renderProgress(value) {
  const percentage = Math.max(0, Math.min(100, value || 0));

  return `
    <div class="progress-container">
      <div class="progress-bar">
        <div
          class="progress-fill"
          style="width: ${percentage}%"
        ></div>
      </div>
      <span>${percentage}%</span>
    </div>
  `;
}

function renderModuleCard(module) {
  const stats = modules.getModuleStats(module.id);

  return `
    <article class="module-card">
      <div class="module-card-content">
        <span class="badge">
          ${escapeHTML(module.category || "Curso")}
        </span>

        <h3>${escapeHTML(module.name)}</h3>

        <p>${escapeHTML(module.description || "")}</p>

        ${renderProgress(stats?.percentage || 0)}

        <p class="muted">
          ${stats?.completed || 0} de ${stats?.total || 0} actividades
        </p>

        <button
          class="btn btn-primary"
          data-action="open-module"
          data-module-id="${escapeHTML(module.id)}"
        >
          Abrir curso
        </button>
      </div>
    </article>
  `;
}

function renderDashboard() {
  const allModules = getAllModules();
  const stats = modules.getGlobalStats();

  const content = `
    <section class="stats-grid">
      <article class="stat-card">
        <span>Módulos</span>
        <h2>${stats.modules}</h2>
      </article>

      <article class="stat-card">
        <span>Actividades completadas</span>
        <h2>${stats.completed}</h2>
      </article>

      <article class="stat-card">
        <span>Progreso general</span>
        <h2>${stats.percentage}%</h2>
      </article>
    </section>

    <section class="content-section">
      <div class="section-heading">
        <h2>Continúa aprendiendo</h2>
        <button
          class="btn btn-secondary"
          data-route="explore"
        >
          Explorar cursos
        </button>
      </div>

      <div class="module-grid">
        ${
          allModules.length
            ? allModules.map(renderModuleCard).join("")
            : renderEmpty(
                "Todavía no tienes cursos",
                "Explora los módulos disponibles para comenzar."
              )
        }
      </div>
    </section>
  `;

  setPage("Tu espacio de aprendizaje", content);
}

function renderExplore() {
  const allModules = getAllModules();

  const content = `
    <section class="content-section">
      <p>
        Aquí encontrarás los cursos disponibles en FORGE.
        Cada curso contiene unidades, lecciones, ejercicios
        y recursos para aprender.
      </p>

      <div class="module-grid">
        ${
          allModules.length
            ? allModules.map(renderModuleCard).join("")
            : renderEmpty(
                "No hay cursos disponibles",
                "Pronto encontrarás nuevos cursos aquí."
              )
        }
      </div>
    </section>
  `;

  setPage("Explorar aprendizaje", content);
}

function renderModule() {
  const module = getModule();

  if (!module) {
    setPage(
      "Curso no encontrado",
      renderEmpty(
        "No encontramos este curso",
        "Regresa a explorar para elegir otro módulo."
      )
    );
    return;
  }

  const stats = modules.getModuleStats(module.id);

  const sectionsHTML = (module.sections || []).map(section => {
    const submodulesHTML = (section.submodules || []).map(submodule => {
      const unitsHTML = (submodule.units || []).map(unit => {
        const lessons = unit.lessons || [];

        const lessonsHTML = lessons.map(lesson => {
          const status = storage.getLessonStatus(
            module.id,
            lesson.id
          );

          const statusLabels = {
            "not-started": "Sin comenzar",
            studied: "Estudiada",
            practiced: "Practicada",
            mastered: "Dominada"
          };

          return `
            <button
              class="lesson-list-item"
              data-action="open-lesson"
              data-lesson-id="${escapeHTML(lesson.id)}"
            >
              <span class="lesson-list-info">
                <strong>${escapeHTML(lesson.title)}</strong>
                <small>
                  ${escapeHTML(lesson.duration || "Lección")}
                  ·
                  ${escapeHTML(statusLabels[status] || "Sin comenzar")}
                </small>
              </span>

              <span aria-hidden="true">›</span>
            </button>
          `;
        }).join("");

        return `
          <article class="unit-card">
            <h4>${escapeHTML(unit.title)}</h4>

            ${
              lessons.length
                ? lessonsHTML
                : renderEmpty(
                    "Sin lecciones",
                    "Esta unidad todavía no tiene lecciones."
                  )
            }
          </article>
        `;
      }).join("");

      return `
        <div class="submodule-block">
          <h3>${escapeHTML(submodule.title)}</h3>
          ${unitsHTML}
        </div>
      `;
    }).join("");

    return `
      <section class="course-section">
        <h2>${escapeHTML(section.title)}</h2>
        ${submodulesHTML}
      </section>
    `;
  }).join("");

  const content = `
    <div class="course-header">
      <span class="badge">
        ${escapeHTML(module.category || "Curso")}
      </span>

      <p>${escapeHTML(module.description || "")}</p>

      ${renderProgress(stats?.percentage || 0)}

      <p>
        ${stats?.completed || 0} de ${stats?.total || 0}
        actividades completadas
      </p>
    </div>

    ${sectionsHTML}
  `;

  setPage(module.name, content);
}

function renderContentBlock(block) {
  const text = escapeHTML(block.text || "");

  switch (block.type) {
    case "heading":
      return `<h3>${text}</h3>`;

    case "paragraph":
      return `<p>${text}</p>`;

    case "list":
    case "ordered-list": {
      const tag = block.type === "ordered-list" ? "ol" : "ul";

      return `
        <${tag}>
          ${(block.items || []).map(item =>
            `<li>${escapeHTML(item)}</li>`
          ).join("")}
        </${tag}>
      `;
    }

    case "code":
      return `
        <div class="lesson-code">
          <div class="code-header">
            ${escapeHTML(block.language || "Código")}
          </div>
          <pre><code>${escapeHTML(block.code || "")}</code></pre>
        </div>
      `;

    case "callout":
      return `
        <aside class="lesson-callout ${escapeHTML(block.variant || "info")}">
          <strong>${escapeHTML(block.title || "Importante")}</strong>
          <p>${text}</p>
        </aside>
      `;

    case "image":
      return `
        <figure class="lesson-image">
          <img
            src="${safeUrl(block.src)}"
            alt="${escapeHTML(block.alt || "")}"
            loading="lazy"
          >
          ${
            block.caption
              ? `<figcaption>${escapeHTML(block.caption)}</figcaption>`
              : ""
          }
        </figure>
      `;

    default:
      return "";
  }
}

function renderResources(resources) {
  if (!resources?.length) {
    return "";
  }

  return `
    <section class="lesson-section">
      <h2>Recursos para profundizar</h2>

      <div class="resource-list">
        ${resources.map(resource => `
          <article class="resource-card">
            <div>
              <span class="badge">
                ${escapeHTML(resource.type || "Recurso")}
              </span>

              <h3>${escapeHTML(resource.title || "Recurso")}</h3>

              <p>${escapeHTML(resource.description || "")}</p>

              <small>
                ${escapeHTML(resource.language || "")}
                ${resource.subtitles
                  ? ` · Subtítulos: ${escapeHTML(resource.subtitles)}`
                  : ""}
                ${resource.free ? " · Gratuito" : ""}
              </small>
            </div>

            <a
              href="${safeUrl(resource.url)}"
              target="_blank"
              rel="noopener noreferrer"
              class="btn btn-secondary"
            >
              Abrir recurso
            </a>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderExercises(lesson) {
  if (!lesson.exercises?.length) {
    return "";
  }

  const progress = storage.getExerciseProgress(
    currentModuleId,
    lesson.id
  );

  return `
    <section class="lesson-section">
      <h2>Practica lo aprendido</h2>

      <p>
        Intenta resolver los siguientes ejercicios antes de consultar
        las pistas.
      </p>

      ${lesson.exercises.map((exercise, index) => {
        const exerciseId = exercise.id || `exercise-${index}`;
        const completed = progress[exerciseId]?.completed;

        return `
          <article class="exercise-card">
            <div class="exercise-heading">
              <h3>
                ${index + 1}. ${escapeHTML(exercise.title || "Ejercicio")}
              </h3>

              <span class="badge">
                ${escapeHTML(exercise.difficulty || "Práctica")}
              </span>
            </div>

            <p>${escapeHTML(exercise.statement || "")}</p>

            ${
              exercise.hint
                ? `
                  <details>
                    <summary>Ver pista</summary>
                    <p>${escapeHTML(exercise.hint)}</p>
                  </details>
                `
                : ""
            }

            ${
              exercise.expectedResult
                ? `
                  <details>
                    <summary>Consultar resultado esperado</summary>
                    <p>${escapeHTML(exercise.expectedResult)}</p>
                  </details>
                `
                : ""
            }

            <button
              class="btn ${completed ? "btn-secondary" : "btn-primary"}"
              data-action="complete-exercise"
              data-lesson-id="${escapeHTML(lesson.id)}"
              data-exercise-id="${escapeHTML(exerciseId)}"
              ${completed ? "disabled" : ""}
            >
              ${completed ? "Ejercicio completado" : "Marcar como practicado"}
            </button>
          </article>
        `;
      }).join("")}
    </section>
  `;
}

function renderQuiz(lesson) {
  if (!lesson.quiz?.length) {
    return "";
  }

  return `
    <section class="lesson-section">
      <h2>Comprueba lo que aprendiste</h2>

      <p>
        Responde las preguntas para comprobar tu comprensión del tema.
      </p>

      <form data-quiz-form>
        ${lesson.quiz.map((question, index) => `
          <fieldset class="quiz-question">
            <legend>
              ${index + 1}. ${escapeHTML(question.question)}
            </legend>

            ${(question.options || []).map((option, optionIndex) => `
              <label class="quiz-option">
                <input
                  type="radio"
                  name="question-${index}"
                  value="${optionIndex}"
                  required
                >
                <span>${escapeHTML(option)}</span>
              </label>
            `).join("")}
          </fieldset>
        `).join("")}

        <button type="submit" class="btn btn-primary">
          Evaluar respuestas
        </button>
      </form>

      <div id="quiz-result" aria-live="polite"></div>
    </section>
  `;
}

function renderLessonPage() {
  const module = getModule();
  const lesson = getLesson();

  if (!module || !lesson) {
    setPage(
      "Lección no encontrada",
      renderEmpty(
        "No encontramos esta lección",
        "Regresa al curso para elegir otra lección."
      )
    );
    return;
  }

  const progress = storage.getLessonProgress(
    module.id,
    lesson.id
  );

  const status = storage.getLessonStatus(
    module.id,
    lesson.id
  );

  const objectives = (lesson.objectives || []).map(item =>
    `<li>${escapeHTML(item)}</li>`
  ).join("");

  const concepts = (lesson.keyConcepts || []).map(concept => `
    <article class="concept-card">
      <h3>${escapeHTML(concept.title)}</h3>
      <p>${escapeHTML(concept.description)}</p>
    </article>
  `).join("");

  const content = `
    <div class="lesson-navigation">
      <button
        class="btn btn-secondary"
        data-action="back-to-module"
      >
        ← Volver al curso
      </button>
    </div>

    <header class="lesson-header">
      <span class="badge">
        ${escapeHTML(lesson.level || "Lección")}
      </span>

      <h2>${escapeHTML(lesson.title)}</h2>

      <p>${escapeHTML(lesson.description || "")}</p>

      <div class="lesson-metadata">
        <span>${escapeHTML(lesson.duration || "Duración variable")}</span>
        <span>${escapeHTML(lesson.difficulty || "Nivel general")}</span>
      </div>
    </header>

    ${
      objectives
        ? `
          <section class="lesson-section">
            <h2>Objetivos de aprendizaje</h2>
            <ul>${objectives}</ul>
          </section>
        `
        : ""
    }

    <section class="lesson-section lesson-content">
      ${(lesson.content || []).map(renderContentBlock).join("")}
    </section>

    ${
      concepts
        ? `
          <section class="lesson-section">
            <h2>Conceptos clave</h2>
            <div class="concept-grid">${concepts}</div>
          </section>
        `
        : ""
    }

    ${renderResources(lesson.resources)}

    ${renderExercises(lesson)}

    ${renderQuiz(lesson)}

    <section class="lesson-section lesson-progress">
      <h2>Tu progreso en esta lección</h2>

      <p>
        Estado actual:
        <strong>${escapeHTML(status)}</strong>
      </p>

      <div class="lesson-status-actions">
        <button
          class="btn btn-secondary"
          data-action="lesson-status"
          data-status="studied"
          data-lesson-id="${escapeHTML(lesson.id)}"
        >
          Marcar como estudiada
        </button>

        <button
          class="btn btn-secondary"
          data-action="lesson-status"
          data-status="practiced"
          data-lesson-id="${escapeHTML(lesson.id)}"
        >
          Marcar como practicada
        </button>

        <button
          class="btn btn-primary"
          data-action="lesson-status"
          data-status="mastered"
          data-lesson-id="${escapeHTML(lesson.id)}"
        >
          Marcar como dominada
        </button>
      </div>
    </section>
  `;

  setPage(lesson.title, content);
}

function renderRoadmap() {
  const allModules = getAllModules();

  const content = `
    <section class="content-section">
      <p>
        Esta es la estructura de aprendizaje de tus cursos.
        Avanza por las secciones y unidades en el orden que prefieras.
      </p>

      ${allModules.map(module => `
        <article class="roadmap-card">
          <h2>${escapeHTML(module.name)}</h2>

          ${(module.sections || []).map(section => `
            <div class="roadmap-section">
              <h3>${escapeHTML(section.title)}</h3>

              ${(section.submodules || []).map(submodule => `
                <div class="roadmap-submodule">
                  <strong>${escapeHTML(submodule.title)}</strong>

                  <ul>
                    ${(submodule.units || []).map(unit => `
                      <li>${escapeHTML(unit.title)}</li>
                    `).join("")}
                  </ul>
                </div>
              `).join("")}
            </div>
          `).join("")}

          <button
            class="btn btn-primary"
            data-action="open-module"
            data-module-id="${escapeHTML(module.id)}"
          >
            Ir al curso
          </button>
        </article>
      `).join("")}
    </section>
  `;

  setPage("Ruta de aprendizaje", content);
}

function renderProjects() {
  setPage(
    "Proyectos",
    renderEmpty(
      "Tu espacio de proyectos",
      "Aquí organizaremos proyectos prácticos para aplicar lo aprendido."
    )
  );
}

function renderStatistics() {
  const allModules = getAllModules();
  const stats = modules.getGlobalStats();

  const content = `
    <section class="stats-grid">
      <article class="stat-card">
        <span>Cursos disponibles</span>
        <h2>${stats.modules}</h2>
      </article>

      <article class="stat-card">
        <span>Actividades realizadas</span>
        <h2>${stats.completed}</h2>
      </article>

      <article class="stat-card">
        <span>Progreso general</span>
        <h2>${stats.percentage}%</h2>
      </article>
    </section>

    <section class="content-section">
      <h2>Progreso por curso</h2>

      ${allModules.map(module => {
        const moduleStats = modules.getModuleStats(module.id);

        return `
          <article class="statistics-card">
            <h3>${escapeHTML(module.name)}</h3>

            ${renderProgress(moduleStats.percentage)}

            <p>
              ${moduleStats.completed} de ${moduleStats.total}
              actividades completadas
            </p>

            <p>
              Lecciones dominadas:
              ${moduleStats.completedLessons} de ${moduleStats.lessons}
            </p>
          </article>
        `;
      }).join("")}
    </section>
  `;

  setPage("Estadísticas de aprendizaje", content);
}

function renderModuleManager() {
  const content = `
    <section class="content-section">
      <h2>Administrar cursos</h2>

      <p>
        Puedes incorporar nuevos módulos utilizando archivos JSON
        compatibles con la estructura de FORGE.
      </p>

      <div class="module-import">
        <label for="module-file">
          Seleccionar archivo JSON
        </label>

        <input
          type="file"
          id="module-file"
          accept=".json,application/json"
        >

        <button
          class="btn btn-primary"
          data-action="import-module"
        >
          Instalar módulo
        </button>
      </div>

      <div id="module-import-result" aria-live="polite"></div>

      <h3>Cursos instalados</h3>

      <div class="module-grid">
        ${getAllModules().map(renderModuleCard).join("")}
      </div>
    </section>
  `;

  setPage("Administrador de módulos", content);
}

function registerRoutes() {
  router.register("dashboard", "Inicio", renderDashboard);
  router.register("explore", "Explorar", renderExplore);
  router.register("roadmap", "Ruta de aprendizaje", renderRoadmap);
  router.register("projects", "Proyectos", renderProjects);
  router.register("statistics", "Estadísticas", renderStatistics);
  router.register("module-manager", "Módulos", renderModuleManager);
  router.register("module", "Curso", renderModule);
  router.register("lesson", "Lección", renderLessonPage);
}

async function loadInitialModule() {
  if (modules.getById("fundamentos-programacion")) {
    return;
  }

  try {
    const response = await fetch(
      new URL("../../data/modules/fundamentos-programacion.json", import.meta.url)
    );

    if (!response.ok) {
      throw new Error("No se pudo cargar el módulo inicial.");
    }

    const module = await response.json();
    const result = modules.install(module);

    if (!result.success) {
      console.error("Errores del módulo:", result.errors);
    }
  } catch (error) {
    console.warn("No se pudo cargar el módulo inicial:", error);
  }
}

function handleQuiz(form) {
  const lesson = getLesson();

  if (!lesson) return;

  const formData = new FormData(form);
  const answers = [];
  let correct = 0;

  lesson.quiz.forEach((question, index) => {
    const selected = formData.get(`question-${index}`);

    if (selected === null) return;

    const answer = Number(selected);

    answers.push({
      question: index,
      selected: answer,
      correct: answer === question.answer
    });

    if (answer === question.answer) {
      correct++;
    }
  });

  const total = lesson.quiz.length;
  const percentage = total
    ? Math.round((correct / total) * 100)
    : 0;

  const passed = percentage >= 80;

  storage.saveQuizResult(
    currentModuleId,
    lesson.id,
    `quiz-${lesson.id}`,
    {
      correct,
      total,
      percentage,
      passed,
      answers
    }
  );

  if (passed) {
    storage.setLessonStatus(
      currentModuleId,
      lesson.id,
      "mastered"
    );
  } else {
    const currentStatus = storage.getLessonStatus(
      currentModuleId,
      lesson.id
    );

    if (currentStatus === "not-started") {
      storage.setLessonStatus(
        currentModuleId,
        lesson.id,
        "studied"
      );
    }
  }

  const result = document.getElementById("quiz-result");

  if (result) {
    result.innerHTML = `
      <div class="quiz-result ${passed ? "success" : "retry"}">
        <h3>${passed ? "¡Buen trabajo!" : "Puedes mejorar"}</h3>

        <p>
          Respuestas correctas: ${correct} de ${total}
        </p>

        <p>Resultado: ${percentage}%</p>

        <p>
          ${
            passed
              ? "Has alcanzado el 80% necesario para dominar esta lección."
              : "Repasa los conceptos y vuelve a intentarlo."
          }
        </p>

        ${lesson.quiz.map((question, index) => `
          <div class="quiz-feedback">
            <strong>${index + 1}. ${escapeHTML(question.question)}</strong>

            <p>
              ${
                answers[index]?.correct
                  ? "Respuesta correcta"
                  : `Respuesta correcta: ${escapeHTML(question.options[question.answer])}`
              }
            </p>

            ${
              question.explanation
                ? `<p>${escapeHTML(question.explanation)}</p>`
                : ""
            }
          </div>
        `).join("")}
      </div>
    `;
  }

  notify("Evaluación guardada.");
}

async function importModule() {
  const input = document.getElementById("module-file");
  const resultContainer = document.getElementById("module-import-result");

  const file = input?.files?.[0];

  if (!file) {
    notify("Selecciona primero un archivo JSON.");
    return;
  }

  try {
    const text = await file.text();
    const module = JSON.parse(text);

    const result = modules.install(module);

    if (!result.success) {
      resultContainer.innerHTML = `
        <div class="lesson-callout warning">
          <strong>No se pudo instalar el módulo</strong>
          <ul>
            ${result.errors.map(error =>
              `<li>${escapeHTML(error)}</li>`
            ).join("")}
          </ul>
        </div>
      `;

      return;
    }

    notify("Módulo instalado correctamente.");
    renderModuleManager();
  } catch (error) {
    notify("El archivo no es un JSON válido.");
  }
}

function handleClick(event) {
  const button = event.target.closest("[data-action]");

  if (!button) return;

  const action = button.dataset.action;

  if (action === "open-module") {
    currentModuleId = button.dataset.moduleId;
    router.navigate("module");
  }

  if (action === "open-lesson") {
    currentLessonId = button.dataset.lessonId;
    router.navigate("lesson");
  }

  if (action === "back-to-module") {
    router.navigate("module");
  }

  if (action === "lesson-status") {
    storage.setLessonStatus(
      currentModuleId,
      button.dataset.lessonId,
      button.dataset.status
    );

    notify("Progreso actualizado.");
    renderLessonPage();
  }

  if (action === "complete-exercise") {
    storage.completeExercise(
      currentModuleId,
      button.dataset.lessonId,
      button.dataset.exerciseId
    );

    notify("Ejercicio registrado.");
    renderLessonPage();
  }

  if (action === "import-module") {
    importModule();
  }
}

function handleSubmit(event) {
  const form = event.target.closest("[data-quiz-form]");

  if (!form) return;

  event.preventDefault();

  if (!form.reportValidity()) return;

  handleQuiz(form);
}

async function initialize() {
  if (!app) {
    console.error("No se encontró el elemento #app.");
    return;
  }

  await loadInitialModule();

  registerRoutes();

  app.addEventListener("click", handleClick);
  app.addEventListener("submit", handleSubmit);

  router.init();
}

initialize();
