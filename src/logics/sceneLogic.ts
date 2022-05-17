import { actions, kea, reducers, path } from "kea";
import { urlToAction } from "kea-router";
import { lazy, LazyExoticComponent } from "react";
import type { sceneLogicType } from "./sceneLogicType";

type ParamsType = Record<string, any>;

export enum Scene {
  Error404 = "error404",
  Main = "main",
  RetrieveMessage = "retrieveMessage",
}

export const urls = {
  default: () => "/",
  retrieveMessage: (messageId: string) => `/m/${messageId}`,
  error404: () => "/404",
};

export const scenes: Record<
  Scene,
  LazyExoticComponent<() => JSX.Element> | (() => JSX.Element)
> = {
  [Scene.Error404]: lazy(() => import("../scenes/Error404")),
  [Scene.Main]: lazy(() => import("../scenes/SendMessage")),
  [Scene.RetrieveMessage]: lazy(() => import("../scenes/RetrieveMessage")),
};

export const routes: Record<string, Scene> = {
  // [urls.default()]: Scene.Main, TODO: Removed for hash routing support (for IPFS)
  [urls.retrieveMessage(":messageId")]: Scene.RetrieveMessage,
  [urls.error404()]: Scene.Error404,
};

export const sceneLogic = kea<sceneLogicType<ParamsType, Scene>>([
  path(["src", "logics", "sceneLogic"]),
  actions({
    setScene: (scene: Scene, params: ParamsType) => ({ scene, params }),
  }),
  reducers({
    scene: [
      Scene.Main as Scene,
      {
        setScene: (_, payload) => payload.scene,
      },
    ],
    params: [
      {} as ParamsType,
      {
        setScene: (_, payload) => payload.params || {},
      },
    ],
  }),
  urlToAction(({ actions }) => {
    const parsedRoutes = Object.fromEntries(
      Object.entries(routes).map(([path, scene]) => [
        path,
        (params: ParamsType, qs: ParamsType, hash: ParamsType) =>
          actions.setScene(scene, params),
      ])
    );

    parsedRoutes["/*"] = (_, __, hashParams) => {
      // :TRICKY: Deploying on IPFS doesn't support well root routing of any path to the same SPA. Non-pretty hack below.
      const hash = window.location.hash.replace("#", "");
      if (
        hash.startsWith("/m/") &&
        hash.charAt(hash.indexOf("/m/") + 1) !== "?"
      ) {
        // This is the /m (RetrieveMessage.tsx) route, handle appropiately
        const messageId = hash.substring(3, hash.indexOf("?"));
        actions.setScene(Scene.RetrieveMessage, {
          messageId: messageId,
          key: hashParams[`/m/${messageId}?key`],
          storage: hashParams.s,
        });
      } else if (hash === "" || hash === urls.default()) {
        actions.setScene(Scene.Main, {});
      } else {
        actions.setScene(Scene.Error404, {});
      }
    };

    return parsedRoutes;
  }),
]);
