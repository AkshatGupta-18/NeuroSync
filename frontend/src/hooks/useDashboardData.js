import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

function useDashboardData() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [assessmentError, setAssessmentError] = useState("");

  const [interpretation, setInterpretation] = useState(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError] = useState("");

  const [reviewAssessmentId, setReviewAssessmentId] = useState(null);
  const [assessmentResponses, setAssessmentResponses] = useState(null);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [responsesError, setResponsesError] = useState("");

  const selectAssessment = useCallback((assessmentId) => {
    setSelectedAssessmentId(assessmentId);
  }, []);

  const openReviewResponses = useCallback((assessmentId) => {
    setReviewAssessmentId(assessmentId);
  }, []);

  const closeReviewResponses = useCallback(() => {
    setReviewAssessmentId(null);
    setAssessmentResponses(null);
    setResponsesLoading(false);
    setResponsesError("");
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadDashboardData = async () => {
      try {
        const [profileResponse, assessmentsResponse] = await Promise.all([
          apiRequest("/users/profile/"),
          apiRequest("/assessments/"),
        ]);

        if (
          profileResponse.status === 401 ||
          assessmentsResponse.status === 401
        ) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!profileResponse.ok) {
          console.error(
            "Profile request failed with status:",
            profileResponse.status
          );
        } else {
          const profileData = await profileResponse.json();

          if (isMounted) {
            setUser(profileData);
          }
        }

        if (!assessmentsResponse.ok) {
          console.error(
            "Assessment request failed with status:",
            assessmentsResponse.status
          );

          if (isMounted) {
            setAssessmentError(
              "We couldn't load your latest wellness assessment."
            );
          }

          return;
        }

        const assessmentsData = await assessmentsResponse.json();

        const assessments = Array.isArray(assessmentsData)
          ? assessmentsData
          : assessmentsData.results || [];

        const completed = assessments
          .filter((assessment) => assessment.status === "completed")
          .sort(
            (a, b) =>
              new Date(b.completed_at || b.created_at) -
              new Date(a.completed_at || a.created_at)
          );

        const latestCompletedAssessment = completed[0] || null;

        if (isMounted) {
          setCompletedAssessments(completed);
          setLatestAssessment(latestCompletedAssessment);
          setSelectedAssessmentId(
            latestCompletedAssessment
              ? latestCompletedAssessment.id
              : null
          );
          setInterpretation(null);
          setInterpretationError("");
          setAssessmentError("");
        }
      } catch (error) {
        console.error("Failed to load dashboard:", error);

        if (isMounted) {
          setAssessmentError(
            "Unable to connect to NeuroSync right now. Please try again."
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          setAssessmentLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    if (!selectedAssessmentId) {
      setInterpretation(null);
      setInterpretationLoading(false);
      setInterpretationError("");

      return undefined;
    }

    let isMounted = true;

    const loadInterpretation = async () => {
      setInterpretationLoading(true);
      setInterpretationError("");
      setInterpretation(null);

      try {
        const interpretationResponse = await apiRequest(
          `/assessments/${selectedAssessmentId}/interpretation/`
        );

        if (interpretationResponse.status === 401) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!interpretationResponse.ok) {
          console.error(
            "Interpretation request failed with status:",
            interpretationResponse.status
          );

          if (isMounted) {
            setInterpretationError(
              "We couldn't load the personalized insights for this assessment."
            );
          }

          return;
        }

        const interpretationData =
          await interpretationResponse.json();

        if (isMounted) {
          setInterpretation(
            interpretationData.interpretation || null
          );
        }
      } catch (error) {
        console.error(
          "Failed to load assessment interpretation:",
          error
        );

        if (isMounted) {
          setInterpretationError(
            "Unable to load this assessment's personalized insights right now."
          );
        }
      } finally {
        if (isMounted) {
          setInterpretationLoading(false);
        }
      }
    };

    loadInterpretation();

    return () => {
      isMounted = false;
    };
  }, [selectedAssessmentId, navigate]);

  useEffect(() => {
    if (!reviewAssessmentId) {
      setAssessmentResponses(null);
      setResponsesLoading(false);
      setResponsesError("");

      return undefined;
    }

    let isMounted = true;

    const loadAssessmentResponses = async () => {
      setResponsesLoading(true);
      setResponsesError("");
      setAssessmentResponses(null);

      try {
        const inputsResponse = await apiRequest(
          `/assessments/${reviewAssessmentId}/inputs/`
        );

        if (inputsResponse.status === 401) {
          clearTokens();

          if (isMounted) {
            navigate("/login", { replace: true });
          }

          return;
        }

        if (!inputsResponse.ok) {
          console.error(
            "Assessment inputs request failed with status:",
            inputsResponse.status
          );

          if (isMounted) {
            setResponsesError(
              "We couldn't load the responses from this assessment."
            );
          }

          return;
        }

        const inputsData = await inputsResponse.json();

        const inputs = Array.isArray(inputsData)
          ? inputsData
          : inputsData.results || [];

        const cognitiveInput = inputs.find(
          (input) => input.input_type === "cognitive"
        );

        const responses =
          cognitiveInput?.metadata?.responses || null;

        if (isMounted) {
          if (responses) {
            setAssessmentResponses(responses);
          } else {
            setResponsesError(
              "This assessment does not contain saved response data."
            );
          }
        }
      } catch (error) {
        console.error(
          "Failed to load assessment responses:",
          error
        );

        if (isMounted) {
          setResponsesError(
            "Unable to load this assessment's saved responses right now."
          );
        }
      } finally {
        if (isMounted) {
          setResponsesLoading(false);
        }
      }
    };

    loadAssessmentResponses();

    return () => {
      isMounted = false;
    };
  }, [reviewAssessmentId, navigate]);

  const selectedAssessment =
    completedAssessments.find(
      (assessment) => assessment.id === selectedAssessmentId
    ) || null;

  const reviewAssessment =
    completedAssessments.find(
      (assessment) => assessment.id === reviewAssessmentId
    ) || null;

  return {
    user,
    latestAssessment,
    completedAssessments,

    selectedAssessment,
    selectedAssessmentId,
    selectAssessment,

    reviewAssessment,
    reviewAssessmentId,
    openReviewResponses,
    closeReviewResponses,
    assessmentResponses,
    responsesLoading,
    responsesError,

    loading,
    assessmentLoading,
    assessmentError,

    interpretation,
    interpretationLoading,
    interpretationError,
  };
}

export default useDashboardData;
