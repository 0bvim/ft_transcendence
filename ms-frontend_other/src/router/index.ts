export interface Route {
  path: string;
  component: () => Promise<{ default: () => HTMLElement }>;
  requiresAuth?: boolean;
  title?: string;
}

export class Router {
  private routes: Route[] = [];
  private appContainer: HTMLElement;

  constructor(appContainer: HTMLElement) {
    this.appContainer = appContainer;
    this.setupEventListeners();
  }

  addRoute(route: Route) {
    this.routes.push(route);
  }

  private setupEventListeners() {
    // Handle browser back/forward buttons
    window.addEventListener("popstate", () => {
      this.handleRouteChange();
    });

    // Handle link clicks
    document.addEventListener("click", (event) => {
      const target = event.target as HTMLElement;
      const link = target.closest("a[data-link]");

      if (link) {
        event.preventDefault();
        const href = link.getAttribute("href");
        if (href) {
          this.navigateTo(href);
        }
      }
    });
  }

  navigateTo(path: string) {
    window.history.pushState({}, "", path);
    this.handleRouteChange();
  }

  private async handleRouteChange() {
    const path = window.location.pathname;
    const route = this.findRoute(path);

    if (!route) {
      this.navigateTo("/");
      return;
    }

    // Check authentication
    if (route.requiresAuth && !this.isAuthenticated()) {
      this.navigateTo("/login");
      return;
    }

    // Update document title
    if (route.title) {
      document.title = `${route.title} - ft_transcendence`;
    }

    await this.renderRoute(route);
  }

  private findRoute(path: string): Route | null {
    return (
      this.routes.find((route) => {
        if (route.path === path) return true;

        // Simple pattern matching for dynamic routes
        const routeParts = route.path.split("/");
        const pathParts = path.split("/");

        if (routeParts.length !== pathParts.length) return false;

        return routeParts.every((part, index) => {
          return part.startsWith(":") || part === pathParts[index];
        });
      }) || null
    );
  }

  private async renderRoute(route: Route) {
    try {
      this.appContainer.innerHTML =
        '<div class="flex items-center justify-center min-h-screen"><div class="text-lg">Loading...</div></div>';

      const module = await route.component();
      const component = module.default();

      this.appContainer.innerHTML = "";
      this.appContainer.appendChild(component);
    } catch (error) {
      console.error("Error rendering route:", error);
      this.appContainer.innerHTML =
        '<div class="flex items-center justify-center min-h-screen text-red-500"><div>Error loading page</div></div>';
    }
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem("accessToken");
  }

  async start() {
    await this.handleRouteChange();
  }
}

// Helper function to create navigation links
export function createLink(
  href: string,
  text: string,
  className: string = "",
): HTMLAnchorElement {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = text;
  link.className = className;
  link.setAttribute("data-link", "true");
  return link;
}
