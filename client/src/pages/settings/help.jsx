import "./help.css";

export default function Help() {
  return (
    <div className="settings-panel help-panel">
      <h2>Help & Support</h2>

      <p>
        This Help section provides guidance on how to use the core features
        of CPSpace. Each module is designed to support emotional awareness,
        self-reflection, and mental wellness in a safe and structured way.
      </p>

      {/* =====================
          CHATBOT
      ====================== */}
      <h4>AI Chatbot Companion</h4>
      <p>
        The AI Chatbot Companion is designed to provide a supportive and
        empathetic conversational space. Users may share thoughts, emotions,
        or daily concerns in a private chat environment.
      </p>
      <p>
        The chatbot adapts its response tone based on your selected
        preferences and may use contextual information such as recent
        emotional patterns to generate more relevant replies.
      </p>
      <p>
        When appropriate, the chatbot may suggest coping strategies to
        encourage healthier emotional regulation. Chat sessions can be
        started, reset, or revisited at any time.
      </p>
      <p>
        The chatbot is intended for emotional support and reflection only
        and should not be considered a replacement for professional mental
        health services.
      </p>

      {/* =====================
          COPING HUB
      ====================== */}
      <h4>Coping Strategy Hub</h4>
      <p>
        The Coping Strategy Hub provides a collection of practical techniques
        to help users manage stress, anxiety, and emotional discomfort.
        Strategies include relaxation exercises, grounding techniques,
        mindfulness activities, and reflective prompts.
      </p>
      <p>
        CPSpace may recommend coping strategies based on assessment results
        or emotional patterns. Users may also browse and explore all available
        strategies freely.
      </p>
      <p>
        Users can bookmark coping strategies for quick access, allowing
        frequently used or helpful techniques to be revisited easily.
      </p>

      {/* =====================
          ASSESSMENTS
      ====================== */}
      <h4>Assessments (PHQ-9 & GAD-7)</h4>
      <p>
        CPSpace includes standardized self-assessment tools to support
        self-awareness of mental well-being. The PHQ-9 focuses on depressive
        symptoms, while the GAD-7 focuses on anxiety-related symptoms.
      </p>
      <p>
        Users are required to answer all questions in each assessment before
        submission. Once completed, the system calculates a total score and
        displays the corresponding severity level.
      </p>
      <p>
        Assessment results are intended for reflection and self-monitoring
        only. They do not represent medical diagnoses. Users may retake
        assessments at any time and review previous results to observe
        changes over time.
      </p>

      {/* =====================
          SETTINGS
      ====================== */}
      <h4>Settings</h4>

      <p>
        The Settings section allows users to manage account information
        and personalize their CPSpace experience. It consists of Profile
        and Preferences.
      </p>

      <p>
        The Profile page allows users to view and update personal information
        such as display name, username, profile image, age, and gender.
        Changes made in the Profile section are saved securely and reflected
        across the platform.
      </p>

      <p>
        Preferences allow users to customize the visual appearance and
        interaction style of CPSpace. This includes adjusting themes,
        accent colors, and chatbot tone.
      </p>
      <p>
        Users may also enable automatic personalization, allowing the system
        to suggest settings based on emotional patterns and usage behavior.
        All preferences can be modified at any time.
      </p>

      {/* =====================
          SUPPORT
      ====================== */}
      <h4>Need Assistance?</h4>
      <p>
        If you encounter technical issues or unexpected behavior, try
        refreshing the page or signing out and back in.
      </p>
      <p>
        If issues persist, please contact the system administrator or
        project support team for further assistance.
      </p>
    </div>
  );
}
