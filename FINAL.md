# 📋 TRABAJO FINAL — Modelos de Datos 2026-1

## 📝 Descripción del Proyecto

Cada grupo debe diseñar e implementar una base de datos completa para un caso real o simulado de su elección. El proyecto debe demostrar dominio de todos los temas vistos en el curso, además de investigar e implementar triggers y procedimientos almacenados.

---

### SCRIPT SQL (2.5 puntos)

| Criterio | Puntos | Descripción |
|----------|--------|-------------|
| **DDL (0.7)** | | |
| 2.1 Creación de base de datos y tablas | 0.3 | CREATE DATABASE, CREATE TABLE con tipos de datos correctos |
| 2.2 Restricciones | 0.2 | PK, FK, NOT NULL, UNIQUE, CHECK, DEFAULT |
| 2.3 Orden de creación | 0.2 | Tablas creadas en orden correcto respetando dependencias |
| **DML (0.8)** | | |
| 2.4 Inserción de datos | 0.2 | INSERT con datos de prueba suficientes (mínimo 10 registros por tabla principal) |
| 2.5 Consultas básicas | 0.3 | Al menos 5 consultas con SELECT, WHERE, ORDER BY, LIMIT, LIKE, BETWEEN |
| 2.6 Consultas con agregación | 0.3 | Al menos 3 consultas con COUNT, SUM, AVG, MIN, MAX, GROUP BY, HAVING |
| **JOINs (0.4)** | | |
| 2.7 Consultas con JOINs | 0.4 | Al menos 3 consultas usando INNER JOIN, LEFT JOIN (mínimo 2 tablas) |
| **Operaciones de conjuntos (0.2)** | | |
| 2.8 UNION, INTERSECT o EXCEPT | 0.2 | Al menos 1 consulta usando operaciones de conjuntos |
| **Triggers y Procedimientos (0.4)** | | |
| 2.9 Triggers | 0.2 | Al menos 1 trigger funcional con justificación de su uso |
| 2.10 Procedimientos almacenados | 0.2 | Al menos 1 procedimiento almacenado funcional con justificación |

---


## ⚠️ Reglas Importantes

- **El script debe ejecutarse sin errores** en PostgreSQL. Si no ejecuta, se pierde la nota de la sección correspondiente.
- **Triggers y procedimientos:** Estos temas se verán en clase antes de la fecha de entrega. Se espera que los investiguen y apliquen al proyecto.
- **Mínimo de tablas:** El proyecto debe tener al menos 5 tablas relacionadas.
- **Debe incluir al menos una relación N:M** (muchos a muchos) con tabla intermedia.

---