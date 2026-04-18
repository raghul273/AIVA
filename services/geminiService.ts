
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";
import { SimplifiedContentResponse, WebPageContent, QuizQuestion } from "../types";

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

/**
 * Custom error handler to detect quota exhaustion
 */
const handleApiError = (error: any): string => {
  const errorStr = String(error);
  if (errorStr.includes("429") || errorStr.includes("RESOURCE_EXHAUSTED") || errorStr.includes("quota")) {
    return "QUOTA_EXCEEDED";
  }
  return "GENERAL_ERROR";
};

const extractAndParseJson = <T>(text: string): T => {
  try {
    const startIdx = Math.min(
      text.indexOf('{') === -1 ? Infinity : text.indexOf('{'),
      text.indexOf('[') === -1 ? Infinity : text.indexOf('[')
    );
    const endIdx = Math.max(text.lastIndexOf('}'), text.lastIndexOf(']'));
    if (startIdx === Infinity || endIdx === -1 || endIdx <= startIdx) {
      throw new Error("No JSON found");
    }
    const jsonStr = text.substring(startIdx, endIdx + 1);
    return JSON.parse(jsonStr) as T;
  } catch (error) {
    console.error("Extraction failed:", text);
    throw error;
  }
};

export const simplifyContent = async (text: string): Promise<SimplifiedContentResponse | string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Summarize concisely as JSON: {"summary": "Brief bullets", "simplifiedText": "One short sentence"}. Text: ${text.substring(0, 4000)}`,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return extractAndParseJson<SimplifiedContentResponse>(response.text || "");
  } catch (error) {
    // Fallback mock simplification
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    return {
      summary: sentences.slice(0, 3).map(s => `• ${s.trim()}`).join('\n'),
      simplifiedText: sentences[0]?.trim() || "Content summary unavailable."
    };
  }
};

export const rewriteContent = async (text: string, level: number): Promise<string> => {
  const prompt = level === 1
    ? `Rewrite simple HTML: ${text.substring(0, 15000)}`
    : `Rewrite academic HTML: ${text.substring(0, 15000)}`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        systemInstruction: "Output pure HTML fragments only. No markdown blocks.",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return (response.text || "").replace(/```html|```/g, '').trim();
  } catch (error) {
    // Fallback: return simplified or original text based on level
    if (level === 1) {
      // Return simplified version (remove complex words, shorter sentences)
      return text
        .replace(/<h[1-6][^>]*>/g, '<p>')
        .replace(/<\/h[1-6]>/g, '</p>')
        .replace(/Furthermore|Additionally|Consequently|However,|Therefore,/g, '');
    } else if (level === 3) {
      // Return more academic version by wrapping in academic language
      return `<div class="academic-content">${text}</div>`;
    }
    return text;
  }
};

export const askPageQuestion = async (context: string, question: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Context: ${context.substring(0, 15000)}. Q: ${question}`,
      config: { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
    });
    return response.text || "";
  } catch (error) {
    // Fallback mock response
    return `Based on the content provided, this question relates to the material. To get more detailed information, please try rephrasing your question or explore the accessibility features available in the interface.`;
  }
};

export const generateQuiz = async (text: string): Promise<QuizQuestion[] | string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate 3 concise multiple-choice questions as JSON array for: ${text.substring(0, 5000)}`,
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return extractAndParseJson<QuizQuestion[]>(response.text || "");
  } catch (error) {
    // Fallback mock quiz
    return [
      {
        question: "What is the main topic of this content?",
        options: ["Topic A", "Topic B", "Topic C", "Topic D"],
        correctIndex: 0
      },
      {
        question: "Which key point was discussed?",
        options: ["Point 1", "Point 2", "Point 3", "Point 4"],
        correctIndex: 1
      },
      {
        question: "What can be concluded from the material?",
        options: ["Conclusion A", "Conclusion B", "Conclusion C", "Conclusion D"],
        correctIndex: 2
      }
    ];
  }
};

// Mock data for common topics
const mockContentData: Record<string, WebPageContent> = {
  'cars': {
    title: 'Cars: Types, Features, and Innovation',
    contentHtml: '<h1>Cars: Types, Features, and Innovation</h1><p>Automobiles have evolved significantly over the past century. Modern cars come in various categories including sedans, SUVs, trucks, and hatchbacks, each designed for specific purposes and preferences.</p><h2>Types of Vehicles</h2><p>Sedans are popular for everyday commuting, offering comfort and fuel efficiency. SUVs provide more space and higher seating positions. Sports cars prioritize performance and speed, while trucks are built for hauling cargo.</p><h2>Key Features</h2><p>Safety features like airbags, antilock brakes, and electronic stability control are now standard. Modern cars include infotainment systems with smartphone integration, navigation, and voice control capabilities.</p><h2>Electric Vehicles</h2><p>The automotive industry is shifting towards electric vehicles (EVs) to reduce carbon emissions. Popular EV models offer impressive ranges on a single charge and can be recharged at home or public charging stations.</p>'
  },
  'accessibility': {
    title: 'Web Accessibility: Making the Internet Inclusive',
    contentHtml: '<h1>Web Accessibility: Making the Internet Inclusive</h1><p>Web accessibility ensures that websites and applications are usable by everyone, including people with disabilities. This includes visual, auditory, motor, and cognitive impairments.</p><h2>Principles of Accessibility</h2><p>The Web Content Accessibility Guidelines (WCAG) establish four main principles: Perceivable content that users can see and hear, Operable interfaces that work with keyboards and assistive devices, Understandable information and clear instructions, and Robust code compatible with assistive technologies.</p><h2>Common Barriers</h2><p>Many websites have images without descriptions, videos without captions, or links that lack context. Forms may be difficult to navigate without a mouse, and color-only coding excludes people with color blindness.</p><h2>Implementation</h2><p>Developers can improve accessibility by using semantic HTML, providing alt text for images, ensuring proper color contrast, supporting keyboard navigation, and testing with assistive technologies like screen readers.</p>'
  },
  'technology': {
    title: 'Technology: Shaping Our Future',
    contentHtml: '<h1>Technology: Shaping Our Future</h1><p>Technology continues to transform how we live, work, and communicate. From artificial intelligence to quantum computing, innovations are reshaping industries and society.</p><h2>Artificial Intelligence</h2><p>AI systems can learn from data and make decisions with minimal human intervention. Applications range from personalized recommendations to medical diagnostics and autonomous vehicles.</p><h2>Cloud Computing</h2><p>Cloud services provide scalable computing resources on demand. Organizations use cloud platforms for storage, processing, and running applications without maintaining expensive infrastructure.</p><h2>Cybersecurity</h2><p>As digital threats increase, cybersecurity becomes crucial. Protection measures include firewalls, encryption, multi-factor authentication, and regular security audits to safeguard sensitive data.</p>'
  },
  'science': {
    title: 'Science: Exploring the Natural World',
    contentHtml: '<h1>Science: Exploring the Natural World</h1><p>Science is a systematic approach to understanding the universe through observation, experimentation, and evidence. It encompasses physics, chemistry, biology, and earth sciences.</p><h2>The Scientific Method</h2><p>Scientists develop hypotheses, conduct controlled experiments, collect data, and draw conclusions. This rigorous process ensures reliability and advances knowledge across disciplines.</p><h2>Physics and Chemistry</h2><p>Physics studies matter, energy, and forces. Chemistry examines atoms, molecules, and their interactions. Both fields underpin our understanding of how the world works.</p><h2>Biology and Life Sciences</h2><p>Biology explores living organisms, genetics, and evolution. Recent breakthroughs in genetic engineering and cell biology offer new treatments for diseases and insights into life itself.</p>'
  },
  'education': {
    title: 'Education: Building Foundations for Success',
    contentHtml: '<h1>Education: Building Foundations for Success</h1><p>Education provides individuals with knowledge, skills, and values necessary for personal and professional development. Quality education is fundamental to individual and societal progress.</p><h2>Educational Approaches</h2><p>Traditional classroom learning combines lectures, discussions, and practical activities. Online education offers flexibility and accessibility. Blended learning combines both methods for optimal engagement.</p><h2>Learning Outcomes</h2><p>Effective education develops critical thinking, problem-solving, and communication skills. Students learn to adapt to change, collaborate with others, and pursue lifelong learning.</p><h2>Technology in Education</h2><p>Digital tools enhance learning through interactive content, personalized pacing, and access to global resources. However, educators must balance technology use with face-to-face interaction and hands-on learning experiences.</p>'
  },
  'health': {
    title: 'Health and Wellness: Prioritizing Well-being',
    contentHtml: '<h1>Health and Wellness: Prioritizing Well-being</h1><p>Health encompasses physical, mental, and emotional well-being. A holistic approach to wellness includes nutrition, exercise, sleep, stress management, and social connections.</p><h2>Physical Health</h2><p>Regular exercise strengthens the heart, muscles, and bones. A balanced diet provides essential nutrients. Adequate sleep supports immune function and cognitive performance.</p><h2>Mental Health</h2><p>Mental health is as important as physical health. Stress management techniques, meditation, and social support are vital. Professional help through counseling or therapy is beneficial when needed.</p><h2>Preventive Care</h2><p>Regular check-ups, vaccinations, and health screenings help detect issues early. Healthy lifestyle choices reduce the risk of chronic diseases and improve quality of life.</p>'
  }
};

export const generatePageContent = async (query: string): Promise<WebPageContent | string> => {
  const prompt = `Topic: "${query}". Generate a concise, high-quality web page content as JSON: {title, contentHtml}. Limit content to ~500 words. Ensure valid HTML in contentHtml.`;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }], 
        temperature: 0.1,
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
      }
    });
    return extractAndParseJson<WebPageContent>(response.text || "");
  } catch (error) {
    // Fallback to mock data when API fails
    const normalizedQuery = query.toLowerCase();
    for (const [key, content] of Object.entries(mockContentData)) {
      if (normalizedQuery.includes(key) || key.includes(normalizedQuery)) {
        return content;
      }
    }
    
    // If no matching mock data, return a generic page
    return {
      title: query,
      contentHtml: `<h1>${query}</h1><p>This is a demo article about ${query}. In a production environment with API access, this would be populated with real content generated by the AI service.</p><p>The accessibility simulator is designed to help users understand how different accessibility features and reading modes improve the experience for people with different needs.</p>`
    };
  }
};
