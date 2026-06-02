# 3D Project Viewer Subpage

The design reference image `../InspirationAssets/projectPage.png` defines the exact layout, spacing, typography, colors, and visual style for this page.

This page must be implemented using the Three.js-based 3D viewer architecture described in `../whyThreejs.md`.

Mandatory implementation requirements:

- Replicate the `InspirationAssets/projectPage.png` design 100% for layout, measurements, spacing, fonts, colors, and component placement.
- Implement an Arabic RTL experience with UI text primarily in Arabic.
- Use modern Arabic typography that matches the design rhythm and supports Arabic rendering.
- Build this page as a display-only 3D project viewer — visitors can inspect the model, but cannot edit or sketch.
- Use Three.js with React Three Fiber for the 3D viewer so the module can be displayed and controlled interactively.
- Render the primary 3D model in GLB format, while supporting additional engineering formats such as GLTF, STL, OBJ, and FBX when needed.
- Include support for multiple orthographic views / "مساقط" as shown in the design.
- Provide interactive 3D controls: orbit, zoom, and fullscreen.
- Ensure the page feels polished, responsive, and matches the visual style of the inspiration asset.

Page purpose:

- Allow visitors to explore the full details of a 3D module in a polished viewer, similar to a SolidWorks review mode.
- Show the model from several angles or projection views as presented in the design image.
- Keep the experience focused on viewing and presentation, not editing or CAD creation.

Developer notes:

- The viewer should be implemented under the `client` directory and may reuse shared components from `components`.
- Add semantic HTML, ARIA labels, and alt text for any images or icons.
- If any design deviation is necessary for accessibility or technical reasons, document the change clearly and explain the rationale.
- Use the image as the source of truth for the visual structure; supplemental textual details may be added if required, but do not conflict with the image.

Additional guidance:

- Use Arabic labels for key actions such as opening the 3D viewer or switching views.
- Ensure the layout is responsive and preserves the visual hierarchy of the original design on mobile and desktop.
- Treat this page as one of the most important pages in the project and prioritize accuracy and polish.
- Addin like and dislike counter too for all 3D modules.
