import PageBreadcrumb from "../components/common/PageBreadCrumb";
import PageMeta from "../components/common/PageMeta";

type BlankProps = {
  title?: string;
  description?: string;
  pageTitle?: string;
  embedded?: boolean;
};

export default function Blank({
  title = "Card Title Here",
  description = "Start putting content on grids or panels, you can also use different combinations of grids.Please check out the dashboard and other pages",
  pageTitle = "Blank Page",
  embedded = false,
}: BlankProps) {
  const content = (
    <div className="mx-auto w-full max-w-[630px] text-center">
      <h3 className="mb-4 text-theme-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
        {title}
      </h3>

      <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">{description}</p>
    </div>
  );

  if (embedded) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white px-5 py-10 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {content}
      </div>
    );
  }

  return (
    <div>
      <PageMeta
        title="React.js Blank Dashboard | TailAdmin - Next.js Admin Dashboard Template"
        description="This is React.js Blank Dashboard page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle={pageTitle} />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        {content}
      </div>
    </div>
  );
}
