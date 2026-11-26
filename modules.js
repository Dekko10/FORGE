
import storage from "./storage.js";

class ModuleManager {
  getAll() {
    return storage.getModules();
  }

  getById(moduleId) {
    return this.getAll().find(module => module.id === moduleId) || null;
  }

  getByCategory(category) {
    return this.getAll().filter(module => module.category === category);
  }

  search(query) {
    const term = String(query || "").toLowerCase().trim();

    if (!term) return this.getAll();

    return this.getAll().filter(module => {
      const text = [
        module.name,
        module.description,
        module.category
      ].join(" ").toLowerCase();

      return text.includes(term);
    });
  }

  install(module) {
    const errors = this.validate(module);

    if (errors.length) {
      return {
        success: false,
        errors
      };
    }

    storage.installModule(module);

    return {
      success: true,
      errors: []
    };
  }

  remove(moduleId) {
    return storage.removeModule(moduleId);
  }

  validate(module) {
    const errors = [];

    if (!module || typeof module !== "object") {
      return ["El módulo debe ser un objeto válido."];
    }

    if (!module.id || typeof module.id !== "string") {
      errors.push("El módulo necesita un identificador.");
    }

    if (!module.name || typeof module.name !== "string") {
      errors.push("El módulo necesita un nombre.");
    }

    if (!Array.isArray(module.sections)) {
      errors.push("El módulo debe contener una lista de secciones.");
      return errors;
    }

    const sectionIds = new Set();
    const submoduleIds = new Set();
    const unitIds = new Set();
    const lessonIds = new Set();
    const pointIds = new Set();

    module.sections.forEach((section, sectionIndex) => {
      const sectionLabel = `Sección ${sectionIndex + 1}`;

      if (!section || typeof section !== "object") {
        errors.push(`${sectionLabel}: estructura inválida.`);
        return;
      }

      if (!section.id || !section.title) {
        errors.push(`${sectionLabel}: necesita id y título.`);
      }

      if (section.id) {
        if (sectionIds.has(section.id)) {
          errors.push(`ID de sección duplicado: ${section.id}`);
        }

        sectionIds.add(section.id);
      }

      if (!Array.isArray(section.submodules)) {
        errors.push(`${sectionLabel}: debe contener submódulos.`);
        return;
      }

      section.submodules.forEach((submodule, submoduleIndex) => {
        const submoduleLabel = `${sectionLabel}, submódulo ${submoduleIndex + 1}`;

        if (!submodule || typeof submodule !== "object") {
          errors.push(`${submoduleLabel}: estructura inválida.`);
          return;
        }

        if (!submodule.id || !submodule.title) {
          errors.push(`${submoduleLabel}: necesita id y título.`);
        }

        if (submodule.id) {
          if (submoduleIds.has(submodule.id)) {
            errors.push(`ID de submódulo duplicado: ${submodule.id}`);
          }

          submoduleIds.add(submodule.id);
        }

        if (!Array.isArray(submodule.units)) {
          errors.push(`${submoduleLabel}: debe contener unidades.`);
          return;
        }

        submodule.units.forEach((unit, unitIndex) => {
          const unitLabel = `${submoduleLabel}, unidad ${unitIndex + 1}`;

          if (!unit || typeof unit !== "object") {
            errors.push(`${unitLabel}: estructura inválida.`);
            return;
          }

          if (!unit.id || !unit.title) {
            errors.push(`${unitLabel}: necesita id y título.`);
          }

          if (unit.id) {
            if (unitIds.has(unit.id)) {
              errors.push(`ID de unidad duplicado: ${unit.id}`);
            }

            unitIds.add(unit.id);
          }

          if (unit.lessons !== undefined && !Array.isArray(unit.lessons)) {
            errors.push(`${unitLabel}: lessons debe ser una lista.`);
          }

          if (unit.points !== undefined && !Array.isArray(unit.points)) {
            errors.push(`${unitLabel}: points debe ser una lista.`);
          }

          const lessons = unit.lessons || [];

          lessons.forEach((lesson, lessonIndex) => {
            const lessonLabel = `${unitLabel}, lección ${lessonIndex + 1}`;

            if (!lesson || typeof lesson !== "object") {
              errors.push(`${lessonLabel}: estructura inválida.`);
              return;
            }

            if (!lesson.id || !lesson.title) {
              errors.push(`${lessonLabel}: necesita id y título.`);
            }

            if (lesson.id) {
              if (lessonIds.has(lesson.id)) {
                errors.push(`ID de lección duplicado: ${lesson.id}`);
              }

              lessonIds.add(lesson.id);
            }

            if (
              lesson.objectives !== undefined &&
              !Array.isArray(lesson.objectives)
            ) {
              errors.push(`${lessonLabel}: objectives debe ser una lista.`);
            }

            if (
              lesson.content !== undefined &&
              !Array.isArray(lesson.content)
            ) {
              errors.push(`${lessonLabel}: content debe ser una lista.`);
            }

            if (
              lesson.resources !== undefined &&
              !Array.isArray(lesson.resources)
            ) {
              errors.push(`${lessonLabel}: resources debe ser una lista.`);
            }

            if (
              lesson.exercises !== undefined &&
              !Array.isArray(lesson.exercises)
            ) {
              errors.push(`${lessonLabel}: exercises debe ser una lista.`);
            }

            if (
              lesson.quiz !== undefined &&
              !Array.isArray(lesson.quiz)
            ) {
              errors.push(`${lessonLabel}: quiz debe ser una lista.`);
            }

            (lesson.resources || []).forEach(resource => {
              if (resource.url && !this.isSafeUrl(resource.url)) {
                errors.push(
                  `${lessonLabel}: URL no válida en el recurso "${resource.title || "sin título"}".`
                );
              }
            });

            (lesson.quiz || []).forEach((question, questionIndex) => {
              if (!Array.isArray(question.options) || question.options.length < 2) {
                errors.push(
                  `${lessonLabel}: pregunta ${questionIndex + 1} necesita al menos dos opciones.`
                );
              }

              if (
                !Number.isInteger(question.answer) ||
                question.answer < 0 ||
                question.answer >= (question.options || []).length
              ) {
                errors.push(
                  `${lessonLabel}: respuesta inválida en la pregunta ${questionIndex + 1}.`
                );
              }
            });
          });

          (unit.points || []).forEach(point => {
            if (!point || !point.id || !point.title) {
              errors.push(`${unitLabel}: cada punto necesita id y título.`);
              return;
            }

            if (pointIds.has(point.id)) {
              errors.push(`ID de punto duplicado: ${point.id}`);
            }

            pointIds.add(point.id);
          });
        });
      });
    });

    return errors;
  }

  isSafeUrl(value) {
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:";
    } catch {
      return false;
    }
  }

  getSections(moduleId) {
    return this.getById(moduleId)?.sections || [];
  }

  getSection(moduleId, sectionId) {
    return this.getSections(moduleId)
      .find(section => section.id === sectionId) || null;
  }

  getSubmodules(moduleId, sectionId) {
    return this.getSection(moduleId, sectionId)?.submodules || [];
  }

  getSubmodule(moduleId, submoduleId) {
    for (const section of this.getSections(moduleId)) {
      const found = section.submodules?.find(
        submodule => submodule.id === submoduleId
      );

      if (found) return found;
    }

    return null;
  }

  getUnits(moduleId, submoduleId) {
    return this.getSubmodule(moduleId, submoduleId)?.units || [];
  }

  getUnit(moduleId, unitId) {
    for (const section of this.getSections(moduleId)) {
      for (const submodule of section.submodules || []) {
        const found = submodule.units?.find(unit => unit.id === unitId);

        if (found) return found;
      }
    }

    return null;
  }

  getLessons(moduleId) {
    const lessons = [];

    for (const section of this.getSections(moduleId)) {
      for (const submodule of section.submodules || []) {
        for (const unit of submodule.units || []) {
          for (const lesson of unit.lessons || []) {
            lessons.push({
              ...lesson,
              sectionId: section.id,
              sectionTitle: section.title,
              submoduleId: submodule.id,
              submoduleTitle: submodule.title,
              unitId: unit.id,
              unitTitle: unit.title
            });
          }
        }
      }
    }

    return lessons;
  }

  getLesson(moduleId, lessonId) {
    return this.getLessons(moduleId)
      .find(lesson => lesson.id === lessonId) || null;
  }

  getLessonsByUnit(moduleId, unitId) {
    return this.getUnit(moduleId, unitId)?.lessons || [];
  }

  findLesson(moduleId, lessonId) {
    for (const section of this.getSections(moduleId)) {
      for (const submodule of section.submodules || []) {
        for (const unit of submodule.units || []) {
          const lesson = (unit.lessons || []).find(
            item => item.id === lessonId
          );

          if (lesson) {
            return {
              lesson,
              section,
              submodule,
              unit
            };
          }
        }
      }
    }

    return null;
  }

  getPoints(moduleId, unitId) {
    return this.getUnit(moduleId, unitId)?.points || [];
  }

  getModuleStats(moduleId) {
    const module = this.getById(moduleId);

    if (!module) return null;

    const lessons = this.getLessons(moduleId);
    const points = [];

    for (const section of module.sections || []) {
      for (const submodule of section.submodules || []) {
        for (const unit of submodule.units || []) {
          points.push(...(unit.points || []));
        }
      }
    }

    const progress = storage.getModuleProgress(moduleId) || {};

    const completedLessons = lessons.filter(
      lesson => progress[lesson.id] === true
    ).length;

    const completedPoints = points.filter(
      point => progress[point.id] === true
    ).length;

    const total = lessons.length + points.length;
    const completed = completedLessons + completedPoints;

    return {
      total,
      completed,
      lessons: lessons.length,
      completedLessons,
      points: points.length,
      completedPoints,
      percentage: total
        ? Math.round((completed / total) * 100)
        : 0
    };
  }

  getGlobalStats() {
    const allModules = this.getAll();

    const stats = allModules.map(module =>
      this.getModuleStats(module.id)
    ).filter(Boolean);

    const total = stats.reduce(
      (sum, item) => sum + item.total,
      0
    );

    const completed = stats.reduce(
      (sum, item) => sum + item.completed,
      0
    );

    return {
      modules: allModules.length,
      total,
      completed,
      percentage: total
        ? Math.round((completed / total) * 100)
        : 0
    };
  }

  completePoint(moduleId, pointId, completed = true) {
    storage.setCompleted(moduleId, pointId, completed);
  }

  togglePoint(moduleId, pointId) {
    return storage.toggleCompleted(moduleId, pointId);
  }
}

const modules = new ModuleManager();

export default modules;
