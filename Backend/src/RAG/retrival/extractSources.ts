interface MaterialSource {
  file: string;
  file_loc: string;
  file_type: string;
  section: string;
}

interface CourseLesson {
  section: string;
  title: string;
}

interface RAGResultItem {
  id: string;
  score: number;
  values: any[];
  metadata: any;
  namespace: string;
}

interface StructuredSources {
  material_sources: MaterialSource[];
  related_course_lessons: CourseLesson[];
}

interface FinalRAGOutput {
  structed_sources: StructuredSources;
}

export function buildFinalRAGResult(
  ragData: { result_from_RAG: RAGResultItem[]; conclusion: string },
): FinalRAGOutput {
  const material_sources: MaterialSource[] = [];
  const related_course_lessons: CourseLesson[] = [];

  for (const item of ragData.result_from_RAG) {
    const meta = item.metadata || {};

    if (item.namespace === "file_summaries") {
      if (meta.file && meta.file_loc && meta.file_type && meta.section) {
        material_sources.push({
          file: meta.file,
          file_loc: meta.file_loc,
          file_type: meta.file_type,
          section: meta.section,
        });
      }
    } else if (item.namespace === "course_lessons") {
      if (meta.title && meta.section) {
        related_course_lessons.push({
          section: meta.section,
          title: meta.title,
        });
      }
    }
  }

  return {
    structed_sources: {
      material_sources,
      related_course_lessons,
    }
  };
}
