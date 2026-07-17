import { ClockIcon, LightBulbIcon } from '@heroicons/react/24/outline';
import { Link, Navigate, useParams } from 'react-router-dom';
import LinkToPreviousPage from '../../components/LinkToPreviousPage';
import { ArticleBlock, getArticle, infoArticles } from './articles';
import SourceNote from './SourceNote';

function renderBlock(block: ArticleBlock, index: number): JSX.Element {
  switch (block.type) {
    case 'heading':
      return (
        <h2 key={index} className="mt-8 mb-3 text-xl font-bold text-gray-900">
          {block.text}
        </h2>
      );
    case 'list':
      return (
        <ul key={index} className="mb-4 list-disc space-y-2 pl-6 text-lg text-gray-700">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    default:
      return (
        <p key={index} className="mb-4 text-lg text-gray-700">
          {block.text}
        </p>
      );
  }
}

export default function Article(): JSX.Element {
  const { articleId = '' } = useParams();
  const article = getArticle(articleId);

  if (!article) {
    return <Navigate replace to="/info" />;
  }

  const index = infoArticles.findIndex(({ id }) => id === article.id);
  const previous = infoArticles[index - 1];
  const next = infoArticles[index + 1];

  return (
    <div className="mx-auto max-w-2xl">
      <LinkToPreviousPage url="/info" label="Toda la información" />
      <h1 className="mt-4 text-3xl font-extrabold text-gray-900">{article.title}</h1>
      <p className="mt-2 mb-6 flex items-center text-sm text-gray-500">
        <ClockIcon className="mr-1 h-4 w-4" /> Lectura de {article.readingMinutes} minutos
      </p>
      <div className="mb-6 flex items-start space-x-3 rounded-md border border-blue-200 bg-blue-50 p-4">
        <LightBulbIcon className="mt-1 h-6 w-6 flex-shrink-0 text-blue-600" />
        <p className="text-lg font-medium text-gray-900">{article.keyMessage}</p>
      </div>
      {article.body.map(renderBlock)}
      <div className="mt-8 rounded-md bg-blue-600 p-5 text-center">
        <Link
          to={article.action.href}
          className="inline-flex items-center rounded-md bg-white px-6 py-3 text-base font-medium text-blue-700 shadow-sm hover:bg-blue-50"
        >
          {article.action.label} →
        </Link>
      </div>
      <div className="mt-8 flex flex-col justify-between space-y-3 border-t border-gray-200 pt-6 sm:flex-row sm:space-y-0">
        {previous ? (
          <Link to={`/info/${previous.id}`} className="text-base font-medium text-sky-700">
            ← {previous.title}
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/info/${next.id}`} className="text-base font-medium text-sky-700 sm:text-right">
            {next.title} →
          </Link>
        )}
      </div>
      <SourceNote />
    </div>
  );
}
