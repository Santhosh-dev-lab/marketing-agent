# Content Studio 2.0: Enhancement Plan

## Objective
Transform the current "Content Studio" into a world-class, all-in-one social media command center. The goal is to move beyond simple text generation to full **multimedia content creation** and **visual storytelling**.

## 1. Feature Recommendations

### A. Deep Visual Intelligence (Gemini Vision)
*   **Feature**: "Image-First Creation"
*   **Concept**: User uploads a product photo or event image. The AI analyzes the visual elements (colors, mood, objects) and writes a caption *specifically* for that image, matching the brand voice.
*   **Tech**: Google Gemini 1.5 Flash/Pro (Existing Key).

### B. AI Image Generation
*   **Feature**: "Text-to-Visuals"
*   **Concept**: If the user doesn't have an image, they can generate one based on the post topic.
*   **API Recommendation**:
    *   **Tier 1 (Best Quality/Text):** **Flux.1 Pro** (via Replicate or Fal.ai). Incredible realism and handles text inside images well.
    *   **Tier 2 (Easiest):** **DALL-E 3** (via OpenAI). Great instruction following, easy formatting.
    *   **Tier 3 (Google Native):** **Imagen 3** (via Vertex AI). Keeps everything in Google ecosystem, but API access can be complex.
    *   **Recommendation**: **Flux.1 (via Replicate)** for the "wow" factor, or **DALL-E 3** for reliability.

### C. Multi-Channel Preview (WYSIWYG)
*   **Feature**: Real-time Mockups.
*   **Concept**: As the user types/generates, show exactly how the post will look on an iPhone screen for Instagram, Twitter, and LinkedIn.
*   **Value**: "Greta" UI feel—users love seeing the final product.

### D. Smart Asset Library
*   **Feature**: Drag-and-Drop Media Manager.
*   **Concept**: A sidebar to store generated images, uploaded logos, and past creatives for easy reuse.

---

## 2. Implementation Roadmap

### Phase 1: Visual Foundation (Immediate)
*   [x] **UI Overhaul**: Redesign `tasks-view` (Done previously).
*   [ ] **Studio UI Upgrade**: Add distinct zones for "Media," "Caption," and "Preview."
*   [ ] **Image Upload**: Add drag-and-drop zone for user images.
*   [ ] **Vision Integration**: Update `generate-content` to accept image data and use Gemini Vision for captions.

### Phase 2: Generation Capabilities
*   [ ] **Image Generator Interface**: Add a "Generate Image" modal/panel.
*   [ ] **Backend Integration**: Connect to Replicate/OpenAI for image generation.
*   [ ] **Scheduling**: a drag-and-drop Calendar view (FullCalendar or custom).

### Phase 3: Analytics & Refinement
*   [ ] **Viral Score**: AI rates the post's potential before publishing.
*   [ ] **Best Time to Post**: Suggestions based on logic.

---

## 3. Technical Specs (Immediate Actions)

We will start by executing **Phase 1**.

### Frontend (`src/app/dashboard/content/page.tsx`)
*   Add a **Split-Pane Layout**: Left for inputs/media, Right for live preview.
*   Add **Image Uploader**: Simple click-to-upload that converts images to Base64 (for passing to AI for now, later Storage).
*   Add **Platform Toggles**: Instantly switch preview mode between platforms.

### Backend (`supabase/functions/generate-content`)
*   Upgrade from `Groq (Llama)` to `Gemini 1.5 Flash` (using existing `GEMINI_API_KEY`).
*   **Why?** Gemini handles *both* text and images natively and cheaply. It is "Multi-modal". We can simplify the stack by using Gemini for everything (Text generation AND Image analysis).
*   **Benefit**: No new API keys needed for Vision features.

## 4. Proposed "Wow" Feature: The "Brief-to-Campaign" Mode
Instead of one post, the user inputs a URL or a Campaign Brief, and the AI generates **5 posts + 5 image prompts** for the week.
