
const STORAGE_KEY = "forge_data_v1";

class ForgeStorage {
  constructor() {
    this.state = this.load();
  }

  createDefaultState() {
    return {
      version: 2,

      profile: {
        name: "Estudiante",
        createdAt: new Date().toISOString()
      },

      progress: {},

      installedModules: [],

      settings: {
        theme: "dark",
        language: "es"
      }
    };
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return this.createDefaultState();
      }

      const parsed = JSON.parse(saved);
      const defaults = this.createDefaultState();

      return {
        ...defaults,
        ...parsed,
        version: 2,

        profile: {
          ...defaults.profile,
          ...(parsed.profile || {})
        },

        progress: parsed.progress || {},

        installedModules: Array.isArray(parsed.installedModules)
          ? parsed.installedModules
          : [],

        settings: {
          ...defaults.settings,
          ...(parsed.settings || {})
        }
      };
    } catch (error) {
      console.error("Error al cargar los datos de FORGE:", error);
      return this.createDefaultState();
    }
  }

  save() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.state)
      );

      return true;
    } catch (error) {
      console.error("Error al guardar los datos:", error);
      return false;
    }
  }

  getState() {
    return structuredClone(this.state);
  }

  getProfile() {
    return this.state.profile;
  }

  updateProfile(data) {
    this.state.profile = {
      ...this.state.profile,
      ...data
    };

    return this.save();
  }

  getModules() {
    return this.state.installedModules;
  }

  getModule(moduleId) {
    return this.state.installedModules.find(
      module => module.id === moduleId
    ) || null;
  }

  installModule(module) {
    const index = this.state.installedModules.findIndex(
      item => item.id === module.id
    );

    if (index >= 0) {
      this.state.installedModules[index] = module;
    } else {
      this.state.installedModules.push(module);
    }

    return this.save();
  }

  removeModule(moduleId) {
    this.state.installedModules =
      this.state.installedModules.filter(
        module => module.id !== moduleId
      );

    delete this.state.progress[moduleId];

    return this.save();
  }

  getProgress(moduleId) {
    if (!this.state.progress[moduleId]) {
      this.state.progress[moduleId] = {};
    }

    return this.state.progress[moduleId];
  }

  getModuleProgress(moduleId) {
    return this.getProgress(moduleId);
  }

  isCompleted(moduleId, itemId) {
    const progress = this.getProgress(moduleId);
    return progress[itemId] === true;
  }

  setCompleted(moduleId, itemId, completed = true) {
    const progress = this.getProgress(moduleId);

    progress[itemId] = completed;

    return this.save();
  }

  toggleCompleted(moduleId, itemId) {
    const completed = !this.isCompleted(moduleId, itemId);

    this.setCompleted(moduleId, itemId, completed);

    return completed;
  }

  getLessonProgress(moduleId, lessonId) {
    const progress = this.getProgress(moduleId);

    return progress[lessonId] || {
      status: "not-started",
      studiedAt: null,
      practicedAt: null,
      masteredAt: null
    };
  }

  setLessonStatus(moduleId, lessonId, status) {
    const allowedStatuses = [
      "not-started",
      "studied",
      "practiced",
      "mastered"
    ];

    if (!allowedStatuses.includes(status)) {
      return false;
    }

    const progress = this.getProgress(moduleId);
    const current = this.getLessonProgress(moduleId, lessonId);

    const now = new Date().toISOString();

    const updated = {
      ...current,
      status,
      updatedAt: now
    };

    if (status === "studied" && !updated.studiedAt) {
      updated.studiedAt = now;
    }

    if (
      ["practiced", "mastered"].includes(status) &&
      !updated.practicedAt
    ) {
      updated.practicedAt = now;
    }

    if (status === "mastered") {
      updated.masteredAt = now;
    }

    progress[lessonId] = updated;

    return this.save();
  }

  getLessonStatus(moduleId, lessonId) {
    const progress = this.getLessonProgress(moduleId, lessonId);

    if (typeof progress === "boolean") {
      return progress ? "mastered" : "not-started";
    }

    return progress.status || "not-started";
  }

  completeExercise(moduleId, lessonId, exerciseId, result = {}) {
    const progress = this.getProgress(moduleId);
    const lesson = this.getLessonProgress(moduleId, lessonId);

    const exercises = lesson.exercises || {};

    exercises[exerciseId] = {
      completed: true,
      completedAt: new Date().toISOString(),
      ...result
    };

    progress[lessonId] = {
      ...lesson,
      exercises
    };

    if (progress[lessonId].status === "not-started") {
      progress[lessonId].status = "practiced";
    }

    return this.save();
  }

  getExerciseProgress(moduleId, lessonId) {
    const lesson = this.getLessonProgress(moduleId, lessonId);

    return lesson.exercises || {};
  }

  saveQuizResult(moduleId, lessonId, quizId, result) {
    const progress = this.getProgress(moduleId);
    const lesson = this.getLessonProgress(moduleId, lessonId);

    const quizzes = lesson.quizzes || {};

    quizzes[quizId] = {
      ...result,
      completedAt: new Date().toISOString()
    };

    progress[lessonId] = {
      ...lesson,
      quizzes
    };

    return this.save();
  }

  getQuizResults(moduleId, lessonId) {
    const lesson = this.getLessonProgress(moduleId, lessonId);

    return lesson.quizzes || {};
  }

  getSettings() {
    return this.state.settings;
  }

  updateSettings(data) {
    this.state.settings = {
      ...this.state.settings,
      ...data
    };

    return this.save();
  }

  exportData() {
    return JSON.stringify(
      this.state,
      null,
      2
    );
  }

  importData(json) {
    try {
      const imported = typeof json === "string"
        ? JSON.parse(json)
        : json;

      if (
        !imported ||
        typeof imported !== "object" ||
        !Array.isArray(imported.installedModules) ||
        typeof imported.progress !== "object"
      ) {
        return {
          success: false,
          message: "El archivo de respaldo no tiene un formato válido."
        };
      }

      this.state = {
        ...this.createDefaultState(),
        ...imported,

        version: 2,

        profile: {
          ...this.createDefaultState().profile,
          ...(imported.profile || {})
        },

        settings: {
          ...this.createDefaultState().settings,
          ...(imported.settings || {})
        }
      };

      const saved = this.save();

      return {
        success: saved,
        message: saved
          ? "Datos importados correctamente."
          : "No se pudieron guardar los datos importados."
      };
    } catch (error) {
      return {
        success: false,
        message: "No se pudo leer el archivo de respaldo."
      };
    }
  }

  reset() {
    this.state = this.createDefaultState();
    return this.save();
  }

  clone() {
    return structuredClone(this.state);
  }
}

const storage = new ForgeStorage();

export default storage;
