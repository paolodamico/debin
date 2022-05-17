import { useValues } from "kea";
import React, { Suspense } from "react";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { sceneLogic, scenes } from "./logics/sceneLogic";

export default function App(): JSX.Element {
  const { scene, params } = useValues(sceneLogic);

  const Scene = scenes[scene] || scenes.error404;

  return (
    <div className="scene-main">
      <Header />
      <Suspense fallback={<div>Loading...</div>}>
        <Scene {...params} />
      </Suspense>
      <Footer />
    </div>
  );
}
