import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";
import { clearTokens } from "../services/auth";

function useDashboardData() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [latestAssessment, setLatestAssessment] = useState(null);
  const [completedAssessments, setCompletedAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [assessmentError, setAssessmentError] = useState("");
  const [interpretation, setInterpretation] = useState(null);
  const [interpretationLoading, setInterpretationLoading] = useState(false);
  const [interpretationError, setInterpretationError] = useState("");

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
          setInterpretation(null);
          setInterpretationError("");
        }

        if (latestCompletedAssessment) {
          if (isMounted) {
            setInterpretationLoading(true);
          }

          const interpretationResponse = await apiRequest(
            `/assessments/${latestCompletedAssessment.id}/interpretation/`
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
                "We couldn't load your personalized wellness insights."
              );
            }
          } else {
            const interpretationData = await interpretationResponse.json();

            if (isMounted) {
              setInterpretation(interpretationData.interpretation || null);
            }
          }
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
          setInterpretationLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return {
    user,
    latestAssessment,
    completedAssessments,
    loading,
    assessmentLoading,
    assessmentError,
    interpretation,
    interpretationLoading,
    interpretationError,
  };
}

export default useDashboardData;
