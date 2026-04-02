import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const BackButton: React.FC = () => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <Button
      onClick={handleBack}
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-white shadow-lg hover:bg-primary/90 flex items-center justify-center transition-all hover:scale-110 hover:shadow-xl"
      title="返回上一页"
    >
      <ArrowLeft className="h-6 w-6" />
    </Button>
  );
};

export default BackButton;