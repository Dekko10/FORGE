
# FORGE — Learning Platform

Plataforma personal de aprendizaje diseñada para desarrollar conocimientos y habilidades en programación y tecnología, desde fundamentos básicos hasta niveles avanzados.

## Objetivo

FORGE busca ofrecer una formación progresiva, organizada y práctica que permita aprender diferentes áreas de la tecnología mediante módulos independientes.

La plataforma está diseñada para que el estudiante pueda:

- Aprender desde cero hasta niveles avanzados.
- Explorar diferentes áreas de la informática.
- Seguir rutas de aprendizaje organizadas.
- Estudiar mediante secciones, unidades y puntos.
- Registrar el progreso de cada aprendizaje.
- Trabajar con proyectos prácticos.
- Incorporar nuevos módulos mediante archivos JSON.

## Áreas de aprendizaje

La plataforma podrá incorporar módulos relacionados con:

- Fundamentos de programación.
- Desarrollo web.
- Desarrollo de aplicaciones móviles.
- Desarrollo de software de escritorio.
- Bases de datos.
- Backend y APIs.
- Frameworks y herramientas.
- Ciencia de datos.
- Inteligencia artificial.
- Ciberseguridad.
- Seguridad web.
- Testing y control de calidad.
- Sistemas operativos.
- Redes y computación.
- Inglés técnico.

## Estructura del proyecto

```text
FORGE/
├── index.html
├── README.md
│
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── layout.css
│   │   ├── components.css
│   │   └── responsive.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── router.js
│   │   ├── storage.js
│   │   ├── modules.js
│   │   └── components.js
│   │
│   └── icons/
│
└── data/
    └── modules/
```

## Tecnologías

- HTML5
- CSS3
- JavaScript moderno (ES Modules)
- JSON
- LocalStorage
- GitHub Pages

No requiere un proceso de compilación ni dependencias externas para su funcionamiento inicial.

## Instalación

1. Clonar o descargar el repositorio.
2. Abrir el proyecto desde un servidor local o publicarlo mediante GitHub Pages.
3. Acceder a `index.html` desde el navegador.

## Instalación de módulos

FORGE permite incorporar contenido mediante paquetes JSON.

Cada paquete representa un módulo de aprendizaje independiente.

La estructura académica se organiza de la siguiente manera:

```text
Módulo
└── Secciones
    └── Submódulos
        └── Unidades
            └── Puntos de aprendizaje
```

Los módulos se importan desde la sección "Administrar módulos".

## Almacenamiento

La primera versión utiliza LocalStorage para guardar:

- Módulos instalados.
- Progreso del estudiante.
- Información básica del perfil.
- Configuración de la plataforma.

Los datos permanecen almacenados en el navegador utilizado.

Se recomienda exportar copias de seguridad periódicamente.

## Estado del proyecto

FORGE se encuentra en desarrollo.

Las funcionalidades se incorporarán progresivamente, priorizando:

1. Estructura y navegación.
2. Gestión de módulos.
3. Sistema de aprendizaje y progreso.
4. Rutas de aprendizaje.
5. Proyectos prácticos.
6. Estadísticas.
7. Mejoras de experiencia y rendimiento.

## Filosofía

Aprender no consiste solamente en completar cursos.

FORGE busca desarrollar comprensión, criterio técnico y capacidad para construir soluciones reales.

**Learn. Build. Understand.**
