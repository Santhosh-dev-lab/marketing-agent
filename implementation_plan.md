# Implementation Plan: Content Studio 2.0

## Context
The user wants to upgrade the Content Studio to support multimedia features, specifically allowing users to upload images for caption generation and upgrading the overall UI to a "premium" experience. The user also requested recommendations for Image Generation APIs.

## API Recommendations
1.  **Text & Vision (Captioning)**: **Google Gemini 1.5 Flash**
    *   **Why**: Existing integration, Free/Cheap tier, Native Multimodal (Text + Image) support.
    *   **Action**: Migrate `generate-content` function from Groq to Gemini.
2.  **Image Generation (Text-to-Image)**: **Replicate (Flux.1 Pro)** or **OpenAI (DALL-E 3)**
    *   **Why**: Flux.1 is currently SOTA (State of the Art) for realism and text rendering.
    *   **Action for Phase 1**: We will focus on *User Uploads* first. We will verify the user has a Replicate or OpenAI key before enabling Image Gen in Phase 2.

## Phase 1: Visual Foundation (Current Scope)

### Step 1: Backend Upgrade (`supabase/functions/generate-content`)
*   **Goal**: Enable Multimodal capabilities (Text + Image Input).
*   **Changes**:
    *   Switch LLM provider from **Groq** to **Gemini**.
    *   Update request schema to accept `image` (base64 string) alongside `topic` and `platform`.
    *   Update system prompt to handle two modes:
        1.  **Text-Only**: "Generate a post about [Topic]"
        2.  **Vision-Mode**: "Write a caption for this image about [Topic]"

### Step 2: Frontend Redesign (`src/app/dashboard/content/page.tsx`)
*   **Goal**: Create a Split-Pane "Studio" Layout.
*   **Layout**:
    *   **Left Pane (Editor)**:
        *   Platform Selector (Tabs: IG, X, LI, FB).
        *   **Media Zone**: Drag-and-drop area to upload an image.
        *   **Topic Input**: Text area for context.
        *   **Generate Button**: Triggers the AI.
    *   **Right Pane (Live Preview)**:
        *   Real-time mobile mockup (Phone frame).
        *   Renders the uploaded/generated image + generated text.
        *   Platform-specific styling (e.g., IG uses square aspect, X uses compact text).

### Step 3: Components & Polish
*   **Image Preview**: Users need to see what they uploaded before generating.
*   **Loading States**: Skeleton loaders inside the Phone Mockup.
*   **Safety**: Limit image size to 4MB (Edge function limits).

## Checklist
- [ ] **Backend**: Create/Update `generate-content` to use `Gemini` with `generateContent` (text-only) or multimodal methods.
- [ ] **Frontend**: Create `PhoneMockup` component.
- [ ] **Frontend**: Implement `ImageUploader` logic (File -> Base64).
- [ ] **Frontend**: Update `ContentStudioPage` to use the new layout.
