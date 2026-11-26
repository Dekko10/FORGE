
import storage from "./storage.js";
import modules from "./modules.js";
import router from "./router.js";
import components from "./components.js";

const app = document.getElementById("app");

class ForgeApp {
    constructor() {
        this.currentModule = null;
        this.searchQuery = "";
    }

    init() {
        this.registerRoutes();
        this.registerEvents();
        this.routerInit();
        this.updateProfile();
        this.setupMobileMenu();
    }

    registerRoutes() {
        router.register("dashboard", "Inicio", () => {
            this.renderDashboard();
        });

        router.register("explore", "Explorar", () => {
            this.renderExplore();
        });

        router.register("roadmap", "Ruta de aprendizaje", () => {
            this.renderRoadmap();
        });

        router.register("projects", "Proyectos", () => {
            this.renderProjects();
        });

        router.register("statistics", "Estadísticas", () => {
            this.renderStatistics();
        });

        router.register("module-manager", "Administrar módulos", () => {
            this.renderModuleManager();
        });
    }

    routerInit() {
        router.init();
    }

    registerEvents() {
        document.addEventListener("click", event => {
            const openModule = event.target.closest("[data-open-module]");

            if (openModule) {
                this.openModule(openModule.dataset.openModule);
            }

            const backButton = event.target.closest("[data-back-modules]");

            if (backButton) {
                this.currentModule = null;
                router.navigate("explore");
            }

            const importButton = event.target.closest("[data-import-module]");

            if (importButton) {
                this.importModule();
            }

            const exportButton = event.target.closest("[data-export-data]");

            if (exportButton) {
                this.exportData();
            }

            const resetButton = event.target.closest("[data-reset-progress]");

            if (resetButton) {
                this.resetProgress();
            }
        });

        document.addEventListener("change", event => {
            if (event.target.matches("[data-point-id]")) {
                this.togglePoint(event.target);
            }
        });

        document.addEventListener("input", event => {
            if (event.target.matches("[data-module-search]")) {
                this.searchQuery = event.target.value;
                this.renderModuleGrid();
            }
        });
    }

    updateProfile() {
        const profile = storage.getProfile();
        const avatar = document.querySelector(".avatar");

        if (avatar && profile.name) {
            avatar.textContent = profile.name
                .trim()
                .charAt(0)
                .toUpperCase();
        }
    }

    setupMobileMenu() {
        const sidebar = document.getElementById("sidebar");
        const toggle = document.getElementById("menu-toggle");

        if (!sidebar || !toggle) return;

        let overlay = document.querySelector(".sidebar-overlay");

        if (!overlay) {
            overlay = document.createElement("div");
            overlay.className = "sidebar-overlay";
            document.body.appendChild(overlay);
        }

        const closeMenu = () => {
            sidebar.classList.remove("open");
            overlay.classList.remove("active");
        };

        toggle.addEventListener("click", () => {
            sidebar.classList.toggle("open");
            overlay.classList.toggle("active");
        });

        overlay.addEventListener("click", closeMenu);

        sidebar.addEventListener("click", event => {
            if (event.target.closest("[data-route]")) {
                closeMenu();
            }
        });
    }

    getGlobalStats() {
        return modules.getGlobalStats();
    }

    renderDashboard() {
        const stats = this.getGlobalStats();
        const installed = modules.getAll();

        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">TU ESPACIO DE APRENDIZAJE</span>
                    <h1>Bienvenido a FORGE</h1>
                    <p>Construye conocimientos, desarrolla habilidades y conviértete en un mejor programador.</p>
                </div>
            </div>

            <div class="stats-grid">
                ${components.statCard(
                    "Módulos instalados",
                    stats.modules,
                    "Áreas disponibles para aprender",
                    "book"
                )}

                ${components.statCard(
                    "Puntos completados",
                    stats.completed,
                    "Conocimientos que has trabajado",
                    "check"
                )}

                ${components.statCard(
                    "Puntos pendientes",
                    stats.remaining,
                    "Contenido que todavía puedes explorar",
                    "target"
                )}

                ${components.statCard(
                    "Progreso general",
                    `${stats.percentage}%`,
                    "Tu avance en FORGE",
                    "chart"
                )}
            </div>

            <div class="dashboard-section">
                ${components.sectionHeader(
                    "Continúa aprendiendo",
                    "Retoma alguno de tus módulos."
                )}

                <div class="module-grid" id="dashboard-modules">
                    ${installed.length
                        ? installed.slice(0, 3).map(module => {
                            const moduleStats = modules.getModuleStats(module.id);
                            return components.moduleCard(module, moduleStats);
                        }).join("")
                        : components.emptyState(
                            "Todavía no tienes módulos",
                            "Instala tu primer módulo para comenzar tu aprendizaje.",
                            "book"
                        )
                    }
                </div>
            </div>

            <div class="dashboard-section">
                ${components.sectionHeader(
                    "Empieza por explorar",
                    "Descubre las áreas de conocimiento que puedes incorporar."
                )}

                <button class="btn btn-primary" data-route="explore">
                    Explorar módulos
                    <span class="btn-icon">${components.icon("arrow")}</span>
                </button>
            </div>
        `;
    }

    renderExplore() {
        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">BIBLIOTECA DE CONOCIMIENTO</span>
                    <h1>Explorar módulos</h1>
                    <p>Encuentra e instala nuevas áreas de aprendizaje.</p>
                </div>
            </div>

            <div class="search-container">
                <span>${components.icon("search")}</span>
                <input
                    type="search"
                    placeholder="Buscar módulos..."
                    data-module-search
                    value="${components.escapeHTML(this.searchQuery)}"
                >
            </div>

            <div class="module-grid" id="explore-module-grid">
                ${this.getModuleCards()}
            </div>
        `;
    }

    getModuleCards() {
        const installed = modules.getAll();

        const filtered = this.searchQuery
            ? modules.search(this.searchQuery)
            : installed;

        if (!filtered.length) {
            return components.emptyState(
                "No encontramos módulos",
                "Prueba con otro término o instala un módulo desde el administrador.",
                "search"
            );
        }

        return filtered.map(module => {
            const stats = modules.getModuleStats(module.id);
            return components.moduleCard(module, stats);
        }).join("");
    }

    renderModuleGrid() {
        const grid = document.getElementById("explore-module-grid");

        if (grid) {
            grid.innerHTML = this.getModuleCards();
        }
    }

    openModule(id) {
        const module = modules.getById(id);

        if (!module) {
            components.toast("No se encontró el módulo.", "error");
            return;
        }

        this.currentModule = module;
        this.renderModuleDetail();
    }

    renderModuleDetail() {
        const module = this.currentModule;

        if (!module) return;

        const sections = module.sections || [];

        app.innerHTML = `
            <button class="btn btn-ghost" data-back-modules>
                ← Volver a módulos
            </button>

            <div class="page-header">
                <div>
                    <span class="eyebrow">${components.escapeHTML(module.category || "MÓDULO")}</span>
                    <h1>${components.escapeHTML(module.name)}</h1>
                    <p>${components.escapeHTML(module.description || "")}</p>
                </div>
            </div>

            ${sections.length
                ? sections.map(section => `
                    <section class="learning-section">
                        <h2>${components.escapeHTML(section.title)}</h2>

                        ${(section.submodules || []).map(submodule => `
                            <div class="learning-submodule">
                                <h3>${components.escapeHTML(submodule.title)}</h3>

                                ${(submodule.units || []).map(unit => `
                                    <div class="learning-unit">
                                        <h4>${components.escapeHTML(unit.title)}</h4>

                                        <div class="checklist">
                                            ${(unit.points || []).map(point => {
                                                const completed = storage.isCompleted(
                                                    module.id,
                                                    point.id
                                                );

                                                return components.checklistItem(
                                                    point,
                                                    completed
                                                );
                                            }).join("")}
                                        </div>
                                    </div>
                                `).join("")}
                            </div>
                        `).join("")}
                    </section>
                `).join("")
                : components.emptyState(
                    "Este módulo todavía no tiene contenido",
                    "Su contenido estará disponible cuando se complete su paquete de aprendizaje.",
                    "book"
                )
            }
        `;
    }

    togglePoint(input) {
        if (!this.currentModule) return;

        const pointId = input.dataset.pointId;

        const result = modules.completePoint(
            this.currentModule.id,
            pointId,
            input.checked
        );

        if (!result) {
            components.toast("No se pudo actualizar el progreso.", "error");
            input.checked = !input.checked;
            return;
        }

        input.closest(".checklist-item")
            ?.classList.toggle("completed", input.checked);

        components.toast(
            input.checked
                ? "Punto completado"
                : "Punto marcado como pendiente"
        );
    }

    renderRoadmap() {
        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">TU CAMINO</span>
                    <h1>Ruta de aprendizaje</h1>
                    <p>Organiza tu formación y sigue avanzando paso a paso.</p>
                </div>
            </div>

            ${components.emptyState(
                "Tu ruta está esperando",
                "Cuando instales módulos y sus contenidos, podrás construir tu recorrido de aprendizaje.",
                "target"
            )}

            <button class="btn btn-primary" data-route="explore">
                Explorar módulos
            </button>
        `;
    }

    renderProjects() {
        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">APRENDER HACIENDO</span>
                    <h1>Proyectos</h1>
                    <p>Convierte tus conocimientos en aplicaciones y soluciones reales.</p>
                </div>
            </div>

            ${components.emptyState(
                "Todavía no hay proyectos",
                "Esta sección permitirá organizar proyectos prácticos relacionados con tus módulos.",
                "folder"
            )}
        `;
    }

    renderStatistics() {
        const stats = this.getGlobalStats();

        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">TU EVOLUCIÓN</span>
                    <h1>Estadísticas</h1>
                    <p>Consulta tu progreso general de aprendizaje.</p>
                </div>
            </div>

            <div class="stats-grid">
                ${components.statCard(
                    "Módulos",
                    stats.modules,
                    "Módulos instalados",
                    "book"
                )}

                ${components.statCard(
                    "Completados",
                    stats.completed,
                    "Puntos terminados",
                    "check"
                )}

                ${components.statCard(
                    "Pendientes",
                    stats.remaining,
                    "Puntos por completar",
                    "clock"
                )}

                ${components.statCard(
                    "Progreso",
                    `${stats.percentage}%`,
                    "Avance total",
                    "chart"
                )}
            </div>

            ${components.progressBar(stats.percentage)}
        `;
    }

    renderModuleManager() {
        app.innerHTML = `
            <div class="page-header">
                <div>
                    <span class="eyebrow">GESTIÓN DE CONTENIDO</span>
                    <h1>Administrar módulos</h1>
                    <p>Instala nuevos paquetes de aprendizaje o exporta tus datos.</p>
                </div>
            </div>

            <div class="card manager-card">
                <h2>Instalar un módulo</h2>
                <p>
                    Selecciona un archivo JSON con la estructura de un módulo
                    de FORGE.
                </p>

                <input
                    type="file"
                    id="module-file"
                    accept=".json,application/json"
                >

                <button
                    class="btn btn-primary"
                    data-import-module
                >
                    Instalar módulo
                </button>
            </div>

            <div class="card manager-card">
                <h2>Datos de FORGE</h2>
                <p>Guarda una copia de seguridad de tu progreso.</p>

                <div class="manager-actions">
                    <button
                        class="btn btn-secondary"
                        data-export-data
                    >
                        Exportar datos
                    </button>

                    <button
                        class="btn btn-danger"
                        data-reset-progress
                    >
                        Reiniciar progreso
                    </button>
                </div>
            </div>

            <div class="dashboard-section">
                ${components.sectionHeader(
                    "Módulos instalados",
                    "Administra los paquetes que tienes disponibles."
                )}

                <div class="module-grid">
                    ${modules.getAll().length
                        ? modules.getAll().map(module => `
                            <article class="module-card">
                                <h3>${components.escapeHTML(module.name)}</h3>
                                <p>${components.escapeHTML(module.description || "")}</p>
                                <button
                                    class="btn btn-secondary"
                                    data-open-module="${components.escapeHTML(module.id)}"
                                >
                                    Abrir módulo
                                </button>
                            </article>
                        `).join("")
                        : components.emptyState(
                            "No hay módulos instalados",
                            "Instala un paquete JSON para comenzar.",
                            "book"
                        )
                    }
                </div>
            </div>
        `;
    }

    async importModule() {
        const input = document.getElementById("module-file");
        const file = input?.files?.[0];

        if (!file) {
            components.toast("Primero selecciona un archivo JSON.", "error");
            return;
        }

        try {
            const text = await file.text();
            const module = JSON.parse(text);

            const result = modules.install(module);

            if (!result.success) {
                components.toast(
                    result.errors.join(" "),
                    "error"
                );
                return;
            }

            this.searchQuery = "";

            components.toast("Módulo instalado correctamente.");

            this.renderModuleManager();

        } catch (error) {
            console.error(error);
            components.toast(
                "El archivo no es un JSON válido.",
                "error"
            );
        }
    }

    exportData() {
        const data = storage.exportData();

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");

        link.href = url;
        link.download = "forge-backup.json";
        link.click();

        URL.revokeObjectURL(url);

        components.toast("Copia de seguridad exportada.");
    }

    resetProgress() {
        const confirmed = window.confirm(
            "¿Seguro que quieres reiniciar todos tus datos y módulos? Esta acción no se puede deshacer."
        );

        if (!confirmed) return;

        storage.reset();

        this.currentModule = null;
        this.searchQuery = "";

        components.toast("FORGE ha sido reiniciado.");

        router.navigate("dashboard");
    }
}

const forge = new ForgeApp();

forge.init();
