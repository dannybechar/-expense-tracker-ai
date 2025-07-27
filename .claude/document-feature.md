\# document-feature

\#\# Description  
Generates both developer-facing technical documentation and user-facing guides for a given feature. Adapts to frontend, backend, or full-stack features by inspecting code structure.

\#\# Inputs  
\- \`featureName\`: Name of the feature to document (e.g., \`password-reset\`)

\#\# Behavior  
1\. \*\*Search Codebase\*\*    
   Searches for relevant files containing or named after the feature.

2\. \*\*Determine Feature Scope\*\*    
   Detects whether the feature is frontend, backend, or full-stack based on file paths and technology used.

3\. \*\*Generate Developer Documentation\*\*    
   Creates a file under \`docs/dev/\`:  
   \- Technical specification  
   \- API endpoints (if backend)  
   \- Component structure (if frontend)  
   \- Data flow, services, business logic  
   \- Cross-reference to the user doc

4\. \*\*Generate User Documentation\*\*    
   Creates a file under \`docs/user/\`:  
   \- Title and simple feature description  
   \- Step-by-step usage instructions  
   \- Placeholders for screenshots (auto-generated if supported)  
   \- Cross-link to developer doc

5\. \*\*Auto-link Related Docs\*\*    
   Detects related features and links them for context.

\---

\#\# Execution Template (Claude will use this logic)

\`\`\`claude  
Given featureName: "{{featureName}}"

1\. Locate all source files related to "{{featureName}}" in the codebase  
   \- Use filename match, folder structure, and keyword scan  
   \- Example matches: src/backend/{{featureName}}, src/frontend/{{featureName}}, routes, services, components

2\. Classify as:  
   \- Frontend: if files found in components/, pages/, styles/  
   \- Backend: if files found in routes/, controllers/, services/  
   \- Full-stack: if found in both

3\. Generate developer doc at \`docs/dev/{{featureName}}-implementation.md\`:  
   \- Title: "{{featureName}} Implementation"  
   \- Section: Overview  
   \- Section: Architecture  
   \- Section: API (for backend)  
   \- Section: UI Flow (for frontend)  
   \- Section: Services & Helpers  
   \- Section: Notes  
   \- Section: Related Docs (autolinked)  
   \- Link to user doc

4\. Generate user doc at \`docs/user/how-to-{{kebabCase(featureName)}}.md\`:  
   \- Title: How to use {{FeatureName}}  
   \- Section: Description  
   \- Section: Step-by-step guide  
     1\. \[Step 1 description\]  
     2\. \[Step 2 description\]  
     ...  
   \- Section: Screenshots  
     \- \!\[Step 1 Screenshot\](../images/{{featureName}}-step1.png)  
     \- ...  
   \- Section: Troubleshooting  
   \- Section: Link to developer docs

5\. If screenshot capture tooling is available:  
   \- Run UI flow and take screenshots  
   \- Save to \`docs/images/{{featureName}}-stepX.png\`

6\. Print summary:  
   \- ✅ Developer doc created: \`docs/dev/{{featureName}}-implementation.md\`  
   \- ✅ User doc created: \`docs/user/how-to-{{kebabCase(featureName)}}.md\`  
