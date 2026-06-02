

# Home Page

The image in the InspirationAssets directory (`homePage.png`) defines the exact design, layout, spacing, typography, colors, and component placement for the Home Page.

Mandatory instructions for implementation:

- Replicate the `InspirationAssets/homePage.png` design 100% (layout, measurements, spacing, fonts, colors, icons, responsiveness) unless explicitly agreed otherwise.
- Implement all visible sections from the image and also add the following logical sections if they are not shown: Hero, About/Bio, Projects (grid of project cards that open the 3D viewer), Skills/Expertise, Contact, and Footer.
- The header must contain anchor links that smoothly scroll to each section.
- All UI text and content must be in Arabic (primary language). Use modern Arabic Google fonts such as Tajawal or Cairo and match the visual rhythm of the image.
- Use Tailwind CSS for styling and Font Awesome for icons. Ensure RTL layout and proper Arabic typography rendering.
- Accessibility & SEO: add semantic headings, alt text for images, and a meta description.

Bio details (set exactly):

- Name (Arabic): أحمد الجاسم
- Name (Latin): Ahmed Al-jassem
- Profession (Arabic): مهندس ميكاترونكس
- Profession (English): Mechatronic Engineer

3D and interaction UX requirements:

- Project cards must include a clear CTA in Arabic: "عرض المشروع ثلاثي الأبعاد" which opens the 3D viewer modal or navigates to [the project viewer page](./3DProjectViewerSubpage.md).
- The 3D viewer must match the visual placement and sizing from the image and support orbit, zoom, and fullscreen.

Development notes for agents and implementers:

- Follow the project's [Constraints](../Constraints.md) and DMM files. Implement the frontend under the `client` directory and reuse components under `components`.
- Exact replication is required: when the image shows a spacing, color, or typography decision, reproduce it in Tailwind. Any added sections or extras must visually match the image's style and alignment.
- If any deviation from the image is necessary (technical or accessibility reasons), document the deviation with rationale and provide screenshots of the proposed change for approval.

All content and additional details are stored in the DMM files; use them as source of truth when building the Home Page.

 