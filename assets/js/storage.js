
const STORAGE_KEY = "forge_data_v1";

const DEFAULT_STATE = {
    version: 1,

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


class ForgeStorage {

    constructor() {
        this.state = this.load();
    }


    // LOAD DATA

    load() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (!saved) {
                return this.clone(DEFAULT_STATE);
            }

            const data = JSON.parse(saved);

            if (!data || data.version !== 1) {
                return this.clone(DEFAULT_STATE);
            }

            return {
                ...this.clone(DEFAULT_STATE),
                ...data,
                profile: {
                    ...DEFAULT_STATE.profile,
                    ...data.profile
                },
                progress: data.progress || {},
                installedModules: Array.isArray(data.installedModules)
                    ? data.installedModules
                    : [],
                settings: {
                    ...DEFAULT_STATE.settings,
                    ...data.settings
                }
            };

        } catch (error) {
            console.error("FORGE: Error loading data", error);
            return this.clone(DEFAULT_STATE);
        }
    }


    // SAVE DATA

    save() {
        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(this.state)
            );

            return true;

        } catch (error) {
            console.error("FORGE: Error saving data", error);
            return false;
        }
    }


    // GET STATE

    getState() {
        return this.clone(this.state);
    }


    // PROFILE

    getProfile() {
        return this.clone(this.state.profile);
    }


    updateProfile(data) {
        this.state.profile = {
            ...this.state.profile,
            ...data
        };

        return this.save();
    }


    // MODULES

    getModules() {
        return this.clone(this.state.installedModules);
    }


    getModule(id) {
        return this.state.installedModules.find(
            module => module.id === id
        ) || null;
    }


    installModule(module) {
        if (
            !module ||
            typeof module.id !== "string" ||
            typeof module.name !== "string"
        ) {
            return false;
        }

        const index = this.state.installedModules.findIndex(
            item => item.id === module.id
        );

        if (index !== -1) {
            this.state.installedModules[index] = this.clone(module);
        } else {
            this.state.installedModules.push(this.clone(module));
        }

        return this.save();
    }


    removeModule(id) {
        this.state.installedModules =
            this.state.installedModules.filter(
                module => module.id !== id
            );

        return this.save();
    }


    // PROGRESS

    getProgress() {
        return this.clone(this.state.progress);
    }


    getModuleProgress(moduleId) {
        return this.clone(
            this.state.progress[moduleId] || {}
        );
    }


    isCompleted(moduleId, pointId) {
        return this.state.progress[moduleId]?.[pointId] === true;
    }


    setCompleted(moduleId, pointId, completed = true) {
        if (!moduleId || !pointId) {
            return false;
        }

        if (!this.state.progress[moduleId]) {
            this.state.progress[moduleId] = {};
        }

        this.state.progress[moduleId][pointId] = completed;

        return this.save();
    }


    toggleCompleted(moduleId, pointId) {
        const current = this.isCompleted(moduleId, pointId);

        return this.setCompleted(
            moduleId,
            pointId,
            !current
        );
    }


    // SETTINGS

    getSettings() {
        return this.clone(this.state.settings);
    }


    updateSettings(data) {
        this.state.settings = {
            ...this.state.settings,
            ...data
        };

        return this.save();
    }


    // BACKUP

    exportData() {
        return JSON.stringify(
            this.state,
            null,
            2
        );
    }


    importData(json) {
        try {
            const data = JSON.parse(json);

            if (
                !data ||
                data.version !== 1 ||
                typeof data.profile !== "object" ||
                typeof data.progress !== "object" ||
                !Array.isArray(data.installedModules) ||
                typeof data.settings !== "object"
            ) {
                return false;
            }

            const previousState = this.state;

            this.state = {
                ...this.clone(DEFAULT_STATE),
                ...data
            };

            if (!this.save()) {
                this.state = previousState;
                return false;
            }

            return true;

        } catch (error) {
            console.error("FORGE: Invalid backup", error);
            return false;
        }
    }


    // RESET

    reset() {
        this.state = this.clone(DEFAULT_STATE);
        return this.save();
    }


    // UTILITIES

    clone(data) {
        return JSON.parse(JSON.stringify(data));
    }

}


// GLOBAL STORAGE INSTANCE

const storage = new ForgeStorage();

export default storage;
