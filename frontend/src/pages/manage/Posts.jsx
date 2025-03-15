import { useNavigate, useParams } from "react-router-dom";
import { BasicContainerBox, ErrorDisplay } from "../../components/BasicComponents";
import { FormPostWrapper } from "../../components/forms/Post";

export function PageManagePosts({}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const onSave = (post) => {
    if (id === "new") {
      navigate(`/manage/posts/${post.id}`);
    }
  };

  if (!id) {
    return (
      <BasicContainerBox maxWidth="lg">
        <ErrorDisplay error={{ message: "No post id provided" }} />
      </BasicContainerBox>
    );
  }

  return (
    <BasicContainerBox containerSx={{ maxWidth: "1500px" }}>
      <FormPostWrapper id={id === "new" ? null : id} onSave={onSave} />
    </BasicContainerBox>
  );
}
