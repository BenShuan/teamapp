import { createFileRoute } from "@tanstack/react-router";


const Index = () => {
  return (
    <div>Home page</div>
  )
}

export default Index  


export const Route = createFileRoute("/")({
  component: Index,
});
