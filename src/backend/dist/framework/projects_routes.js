"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectRouter = createProjectRouter;
const express = __importStar(require("express"));
const project_1 = require("../domain/project");
function createProjectRouter(projectService) {
    const router = express.Router();
    // Create a project
    router.post("/projects", async (req, res) => {
        try {
            const project = await projectService.createProject(new project_1.CreateProjectCommand(req.body.title, req.body.description, req.body.user_id));
            res.status(201).json(project);
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Get project by ID
    router.get("/project/:id", async (req, res) => {
        try {
            const projectId = parseInt(req.params.id);
            if (isNaN(projectId)) {
                res.status(400).json({ error: "Invalid project ID" });
            }
            else {
                const project = await projectService.getProjectById(projectId);
                if (project) {
                    res.status(200).json(project);
                }
                else {
                    res.status(404).json({ error: "Project not found" });
                }
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Get projects by user ID
    router.get('/projects/:userId', async (req, res) => {
        try {
            const userId = parseInt(req.params.userId);
            console.log(userId, "SES");
            if (isNaN(userId)) {
                res.status(400).json({ error: "Invalid user ID" });
            }
            else {
                const projects = await projectService.getProjectsByUserId(userId);
                console.log(projects, "SES");
                res.status(200).json(projects || []);
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Update project
    router.put("/project/:id", async (req, res) => {
        try {
            const projectId = parseInt(req.params.id);
            if (isNaN(projectId)) {
                res.status(400).json({ error: "Invalid project ID" });
            }
            else {
                const updatedProject = await projectService.updateProject(projectId, req.body);
                if (updatedProject) {
                    res.status(200).json(updatedProject);
                }
                else {
                    res.status(404).json({ error: "Project not found" });
                }
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Delete project
    router.delete("/project/:id", async (req, res) => {
        try {
            const projectId = parseInt(req.params.id);
            if (isNaN(projectId)) {
                res.status(400).json({ error: "Invalid project ID" });
            }
            else {
                const success = await projectService.deleteProject(projectId);
                if (success) {
                    res.status(204).send();
                }
                else {
                    res.status(404).json({ error: "Project not found" });
                }
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Add user to project
    router.post("/projects/:projectId/users/:userId", async (req, res) => {
        try {
            const projectId = parseInt(req.params.projectId);
            const userId = parseInt(req.params.userId);
            if (isNaN(projectId) || isNaN(userId)) {
                res.status(400).json({ error: "Invalid project or user ID" });
            }
            else {
                await projectService.addUserToProject(projectId, userId, req.body.role);
                res.status(201).send();
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    // Remove user from project
    router.delete("/projects/:projectId/users/:userId", async (req, res) => {
        try {
            const projectId = parseInt(req.params.projectId);
            const userId = parseInt(req.params.userId);
            if (isNaN(projectId) || isNaN(userId)) {
                res.status(400).json({ error: "Invalid project or user ID" });
            }
            else {
                const success = await projectService.removeUserFromProject(projectId, userId);
                if (success) {
                    res.status(204).send();
                }
                else {
                    res.status(404).json({ error: "User not found in project" });
                }
            }
        }
        catch (error) {
            res.status(500).json({ error: `${error}` });
        }
    });
    return router;
}
