
import storage from "./storage.js";


class ModuleManager {

    constructor() {
        this.storage = storage;
    }


    // MODULE CATALOG

    getAll() {
        return this.storage.getModules();
    }


    getById(id) {
        return this.storage.getModule(id);
    }


    getByCategory(category) {
        return this.getAll().filter(
            module => module.category === category
        );
    }


    search(query) {
        const term = query.trim().toLowerCase();

        if (!term) {
            return this.getAll();
        }

        return this.getAll().filter(module => {

            const name = module.name?.toLowerCase() || "";
            const description = module.description?.toLowerCase() || "";
            const category = module.category?.toLowerCase() || "";

            return (
                name.includes(term) ||
                description.includes(term) ||
                category.includes(term)
            );

        });
    }


    // MODULE INSTALLATION

    install(module) {
        const validation = this.validate(module);

        if (!validation.valid) {
            return {
                success: false,
                errors: validation.errors
            };
        }

        const installed = this.storage.installModule(module);

        return {
            success: installed,
            errors: installed ? [] : ["No se pudo guardar el módulo."]
        };
    }


    remove(id) {
        return this.storage.removeModule(id);
    }


    // MODULE VALIDATION

    validate(module) {

        const errors = [];

        if (!module || typeof module !== "object") {
            return {
                valid: false,
                errors: ["El módulo no es válido."]
            };
        }

        if (
            typeof module.id !== "string" ||
            !/^[a-z0-9_-]+$/.test(module.id)
        ) {
            errors.push("Identificador inválido.");
        }

        if (
            typeof module.name !== "string" ||
            !module.name.trim()
        ) {
            errors.push("El módulo necesita un nombre.");
        }

        if (!Array.isArray(module.sections)) {
            errors.push("El módulo necesita una lista de secciones.");
        } else {

            const sectionIds = new Set();

            module.sections.forEach((section, index) => {

                if (
                    !section ||
                    typeof section.id !== "string" ||
                    !section.id.trim()
                ) {
                    errors.push(`Sección ${index + 1}: identificador inválido.`);
                    return;
                }

                if (sectionIds.has(section.id)) {
                    errors.push(`Identificador de sección duplicado: ${section.id}`);
                }

                sectionIds.add(section.id);

                if (!Array.isArray(section.submodules)) {
                    errors.push(`Sección ${section.id}: faltan los submódulos.`);
                    return;
                }

                const submoduleIds = new Set();

                section.submodules.forEach(submodule => {

                    if (
                        !submodule ||
                        typeof submodule.id !== "string" ||
                        !submodule.id.trim()
                    ) {
                        errors.push(`Sección ${section.id}: submódulo inválido.`);
                        return;
                    }

                    if (submoduleIds.has(submodule.id)) {
                        errors.push(`Submódulo duplicado: ${submodule.id}`);
                    }

                    submoduleIds.add(submodule.id);

                    if (!Array.isArray(submodule.units)) {
                        errors.push(`Submódulo ${submodule.id}: faltan las unidades.`);
                        return;
                    }

                    const unitIds = new Set();

                    submodule.units.forEach(unit => {

                        if (
                            !unit ||
                            typeof unit.id !== "string" ||
                            !unit.id.trim()
                        ) {
                            errors.push(`Submódulo ${submodule.id}: unidad inválida.`);
                            return;
                        }

                        if (unitIds.has(unit.id)) {
                            errors.push(`Unidad duplicada: ${unit.id}`);
                        }

                        unitIds.add(unit.id);

                        if (!Array.isArray(unit.points)) {
                            errors.push(`Unidad ${unit.id}: faltan los puntos.`);
                            return;
                        }

                        const pointIds = new Set();

                        unit.points.forEach(point => {

                            if (
                                !point ||
                                typeof point.id !== "string" ||
                                !point.id.trim()
                            ) {
                                errors.push(`Unidad ${unit.id}: punto inválido.`);
                                return;
                            }

                            if (pointIds.has(point.id)) {
                                errors.push(`Punto duplicado: ${point.id}`);
                            }

                            pointIds.add(point.id);

                            if (
                                typeof point.title !== "string" ||
                                !point.title.trim()
                            ) {
                                errors.push(`Punto ${point.id}: falta el título.`);
                            }

                        });

                    });

                });

            });

        }

        return {
            valid: errors.length === 0,
            errors
        };

    }


    // SECTIONS

    getSections(moduleId) {
        const module = this.getById(moduleId);

        return module?.sections || [];
    }


    getSection(moduleId, sectionId) {

        const sections = this.getSections(moduleId);

        return sections.find(
            section => section.id === sectionId
        ) || null;

    }


    // SUBMODULES

    getSubmodules(moduleId, sectionId) {

        const section = this.getSection(
            moduleId,
            sectionId
        );

        return section?.submodules || [];
    }


    getSubmodule(moduleId, sectionId, submoduleId) {

        return this.getSubmodules(moduleId, sectionId).find(
            submodule => submodule.id === submoduleId
        ) || null;

    }


    // UNITS

    getUnits(moduleId, sectionId, submoduleId) {

        const submodule = this.getSubmodule(
            moduleId,
            sectionId,
            submoduleId
        );

        return submodule?.units || [];
    }


    getUnit(moduleId, sectionId, submoduleId, unitId) {

        return this.getUnits(
            moduleId,
            sectionId,
            submoduleId
        ).find(unit => unit.id === unitId) || null;

    }


    // LEARNING POINTS

    getPoints(moduleId, sectionId, submoduleId, unitId) {

        const unit = this.getUnit(
            moduleId,
            sectionId,
            submoduleId,
            unitId
        );

        return unit?.points || [];

    }


    // PROGRESS CALCULATION

    getModuleStats(moduleId) {

        const module = this.getById(moduleId);

        if (!module) {
            return {
                total: 0,
                completed: 0,
                percentage: 0
            };
        }

        let total = 0;
        let completed = 0;

        const progress = this.storage.getModuleProgress(moduleId);

        module.sections.forEach(section => {

            section.submodules.forEach(submodule => {

                submodule.units.forEach(unit => {

                    unit.points.forEach(point => {

                        total++;

                        if (progress[point.id] === true) {
                            completed++;
                        }

                    });

                });

            });

        });

        return {
            total,
            completed,
            percentage: total
                ? Math.round((completed / total) * 100)
                : 0
        };

    }


    getGlobalStats() {

        const modules = this.getAll();

        let total = 0;
        let completed = 0;

        modules.forEach(module => {

            const stats = this.getModuleStats(module.id);

            total += stats.total;
            completed += stats.completed;

        });

        return {
            modules: modules.length,
            total,
            completed,
            percentage: total
                ? Math.round((completed / total) * 100)
                : 0
        };

    }


    // POINT COMPLETION

    completePoint(moduleId, pointId, completed = true) {

        const module = this.getById(moduleId);

        if (!module) {
            return false;
        }

        const exists = module.sections.some(section =>
            section.submodules.some(submodule =>
                submodule.units.some(unit =>
                    unit.points.some(point => point.id === pointId)
                )
            )
        );

        if (!exists) {
            return false;
        }

        return this.storage.setCompleted(
            moduleId,
            pointId,
            completed
        );

    }


    togglePoint(moduleId, pointId) {

        const module = this.getById(moduleId);

        if (!module) {
            return false;
        }

        const exists = module.sections.some(section =>
            section.submodules.some(submodule =>
                submodule.units.some(unit =>
                    unit.points.some(point => point.id === pointId)
                )
            )
        );

        if (!exists) {
            return false;
        }

        return this.storage.toggleCompleted(
            moduleId,
            pointId
        );

    }

}


const modules = new ModuleManager();

export default modules;
