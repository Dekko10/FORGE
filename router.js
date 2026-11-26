class ForgeRouter {
    constructor() {
        this.routes = new Map();
        this.currentRoute = null;

        this.handleClick = this.handleClick.bind(this);
        this.handleHashChange = this.handleHashChange.bind(this);
    }

    register(name, title, render) {
        if (!name || typeof render !== "function") {
            console.error("No se pudo registrar la ruta:", name);
            return;
        }

        this.routes.set(name, {
            title,
            render
        });
    }

    init() {
        document.addEventListener("click", this.handleClick);
        window.addEventListener("hashchange", this.handleHashChange);

        const initialRoute = window.location.hash.slice(1);

        const route = this.routes.has(initialRoute)
            ? initialRoute
            : "dashboard";

        this.navigate(route, false);
    }

    navigate(name, updateUrl = true) {
        if (!this.routes.has(name)) {
            name = "dashboard";
        }

        if (updateUrl && window.location.hash !== `#${name}`) {
            window.location.hash = name;
            return;
        }

        this.render(name);
    }

    render(name) {
        const route = this.routes.get(name);

        if (!route) return;

        this.currentRoute = name;

        this.updateMenu(name);
        this.updateBreadcrumb(route.title);

        try {
            route.render();

            document.dispatchEvent(
                new CustomEvent("forge:route-change", {
                    detail: {
                        route: name,
                        title: route.title
                    }
                })
            );

        } catch (error) {
            console.error("Error al cargar la sección:", error);

            const app = document.getElementById("app");

            if (app) {
                app.innerHTML = `
                    <div class="empty-state">
                        <h3>No se pudo cargar esta sección</h3>
                        <p>Intenta nuevamente más tarde.</p>
                    </div>
                `;
            }
        }
    }

    updateMenu(name) {
        const items = document.querySelectorAll("[data-route]");

        items.forEach(item => {
            item.classList.toggle(
                "active",
                item.dataset.route === name
            );
        });
    }

    updateBreadcrumb(title) {
        const breadcrumb = document.getElementById("breadcrumb");

        if (breadcrumb) {
            breadcrumb.textContent = `Workspace / ${title}`;
        }
    }

    handleClick(event) {
        const item = event.target.closest("[data-route]");

        if (!item) return;

        event.preventDefault();

        this.navigate(item.dataset.route);
    }

    handleHashChange() {
        const route = window.location.hash.slice(1);

        this.navigate(route, false);
    }

    getCurrentRoute() {
        return this.currentRoute;
    }
}

const router = new ForgeRouter();

export default router;
